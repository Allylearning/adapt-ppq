import Adapt from 'core/js/adapt';
import QuestionView from 'core/js/views/questionView';
import Draggabilly from 'libraries/draggabilly';
import round from 'libraries/round';
import PinView from './ppqPinView';

class PpqView extends QuestionView {

  events() {
    return {
      'click .js-ppq-pinboard': 'onPinboardClicked',
      'click .ppq-hotspot-btn': 'onHotspotActivated',
      'keydown .ppq-hotspot-btn': 'onHotspotKeydown'
    };
  }

  initialize(...args) {
    super.initialize(...args);

    // unsafe to run in postRender due to QuestionView deferreds
    this.setupPinboardImage(Adapt.device.screenSize);
    this.setupCorrectZones();
    this.addPinViews();

    if (this.model.get('_isSubmitted')) this.showMarking();

    this.checkCompatibility();
  }

  addPinViews() {
    const userAnswer = _.extend([], this.model.get('_userAnswer'));

    // restore positions if submitted
    if (this.model.get('_isSubmitted') && userAnswer.length > 0) {
      userAnswer.shift();
    }

    // pre-population simplifies code (particularly hide/show user answer)
    for (let i = 0, l = this.model.get('_maxSelection'); i < l; i++) {
      const pin = new PinView();
      pin.setPosition(userAnswer[i * 2] / 100, userAnswer[i * 2 + 1] / 100);
      this._pinViews.push(pin);
      this.$('.ppq-boundary').append(pin.$el);
    }
  }

  resetQuestionOnRevisit() {
    this.resetQuestion();
  }

  setupQuestion() {
    if (!this.model.has('_minSelection')) this.model.set('_minSelection', 1);

    this.model.set('_maxSelection', Math.max(this.model.get('_maxSelection') || 0, this.model.get('_items').length));

    this._pinViews = [];

    this.model.get('_items').forEach((item, index) => {
      item._isCorrect = 0;
    });

    this.model.restoreUserAnswers();
  }

  setupPinboardImage(screenSize) {
    const imageObj = screenSize === 'small' ? this.model.get('_pinboardMobile') : this.model.get('_pinboardDesktop');
    if (imageObj) {
      this.$('img.ppq-pinboard').attr({
        'src': imageObj.src,
        'alt': imageObj.alt,
        'title': imageObj.title
      });
    }
  }

  setupCorrectZones() {
    let props, isDesktop = Adapt.device.screenSize !== 'small';

    this.model.get('_items').forEach((item, index) => {
      props = isDesktop ? item.desktop : item.mobile;
      this.$('.ppq-correct-zone').eq(index).css({ left:props.left + '%', top:props.top + '%', width:props.width + '%', height:props.height + '%' });
    });
  }

  disableQuestion() {
    this.setAllItemsEnabled(false);
  }

  enableQuestion() {
    this.setAllItemsEnabled(true);
  }

  setAllItemsEnabled(isEnabled) {
    _.each(this._pinViews, function(pin) {
      if (pin.dragObj) {
        isEnabled ? pin.dragObj.enable() : pin.dragObj.disable();
      }
    });
  }

  updatePinPositions() {
    const $pinboard = this.$('.ppq-pinboard');
    const boardw = $pinboard.width();
    const boardh = $pinboard.height();
    let pin, pos;

    for (let i = 0, l = this._pinViews.length; i < l; i++) {
      pin = this._pinViews[i];
      pos = pin.getPosition();

      if (pos) {
        pin.$el.css({
          left:boardw * pos.percentX / 100 - pin.$el.width() / 2,
          top:boardh * pos.percentY / 100 - pin.$el.height() / 2
        });
      }
    }
  }

  onQuestionRendered() {
    const $pinboardContainerInner = this.$('.ppq-pinboard-container-inner');

    $pinboardContainerInner.imageready(_.bind(function() {
      for (let i = 0, l = this._pinViews.length; i < l; i++) {
        const pin = this._pinViews[i];

        pin.dragObj = new Draggabilly(pin.el, {
          containment: $pinboardContainerInner
        });

        if (!this.model.get('_isEnabled')) pin.dragObj.disable();

        pin.dragObj.on('dragStart', _.bind(this.onDragStart, this, pin));
        pin.dragObj.on('dragEnd', _.bind(this.onDragEnd, this, pin));
      }

      this.setReadyStatus();

      if (this.model.get('_isSubmitted')) {
        this.updatePinPositions();
      } else {
        this.placePins();
      }
    }, this));

    this.listenTo(Adapt, 'device:changed', this.onDeviceChanged);
    this.listenTo(Adapt, 'device:resize', this.updatePinPositions);
  }

  onDeviceChanged(screenSize) {
    this.setupPinboardImage(screenSize);
    this.setupCorrectZones();

    if (this.model.get('_resetPinsOnPinboardChange')) {
      if (this.model.get('_isSubmitted')) {
        this.checkCompatibility();
      } else {
        this.resetPins();
      }
    } else {
      this.updatePinPositions();
    }
  }

  checkCompatibility() {
    const isSubmitted = this.model.get('_isSubmitted');

    if (!isSubmitted) return;

    const isDesktop = Adapt.device.screenSize !== 'small';
    const isUserAnswerDesktop = this.model.get('_userAnswer')[0] === 1;
    const resetPinsOnPinboardChange = this.model.get('_resetPinsOnPinboardChange');
  }

  getNextUnusedPin() {
    for (let i=0, l=this._pinViews.length; i<l; i++) {
      if (!this._pinViews[i].$el.is('.in-use')) return this._pinViews[i];
    }
    return null;
  }

  onPinboardClicked(event) {
    event.preventDefault();

    const pin = this.getNextUnusedPin();

    if (!pin || this.$('.component__widget').is('.is-disabled')) return;

    const offset = this.$('.ppq-pinboard').offset();
    const $pinboard = this.$('.ppq-pinboard');
    const boardw = $pinboard.width();
    const boardh = $pinboard.height();
    let x = event.pageX-offset.left;
    let y = event.pageY-offset.top;
    const pinWidth = pin.$el.width() / 2;
    const pinHeight = pin.$el.height() / 2;

    // Constrain pin on the left
    if (x < pinWidth) {
      x = pinWidth;
    }

    // Constrain pin on the right
    if (x > (boardw - pinWidth)) {
      x = boardw - pinWidth;
    }

    // Constrain pin on the top
    if (y < pinHeight) {
      y = pinHeight;
    }

    // Constrain pin on the bottom
    if (y > (boardh - pinHeight)) {
      y = boardh - pinHeight;
    }

    const percentX = 100 * x / boardw;
    const percentY = 100 * y / boardh;

    pin.$el.css({
      left: x - pinWidth,
      top: y - pinHeight
    });

    pin.setPosition(percentX, percentY);

    this.checkCompletionStatus();
  }

  placePins() {
    if (!this.model.get('_showPinsOnLoad')) return;

    const $pins = this.$el.find('.ppq-pin');
    const $pinboard = this.$('.ppq-pinboard');
    const boardw = $pinboard.width();
    const boardh = $pinboard.height();

    const itemBoardw = boardw / $pins.length;

    _.each(this._pinViews, function(pin, pinIndex) {

      const x = (itemBoardw * pinIndex) + (itemBoardw / 2);
      const y = 70;

      const percentX = 100 * x / boardw;
      const percentY = 100 * y / boardh;

      pin.$el.css({
        left: x - pin.$el.width() / 2,
        top: y - pin.$el.height() / 2
      });
      pin.setPosition(percentX, percentY);
    }, this);
  }

  storeUserAnswer() {
    const userAnswer = [Adapt.device.screenSize === 'small' ? 0 : 1];
    let pin, pos;

    for (let i=0, l=this._pinViews.length; i<l; i++) {
      pin = this._pinViews[i];
      pos = pin.getPosition();

      if (pos) userAnswer.push(round(pos.percentX*100, -2), round(pos.percentY*100, -2));
    }

    this.model.set('_userAnswer', userAnswer);
  }

  showMarking() {
    if (!this.model.get('_canShowMarking')) return;

    const map = new Array(this.model.get('_items').length);

    for (let i=0, l=this._pinViews.length; i<l; i++) {
      const pin = this._pinViews[i];
      const pos = pin.getPosition();

      if (pos) {
        const itemIndex = this.model.getIndexOfItem(pos.percentX, pos.percentY);

        // if pin inside item mark as correct, but mark any others in same item as incorrect
        if (itemIndex !== -1 && !map[itemIndex]) {
          map[itemIndex] = true;
          pin.$el.addClass('correct').removeClass('incorrect');
        } else {
          pin.$el.addClass('incorrect').removeClass('correct');
        }
      }
    }
  }

  resetQuestion() {
    this.resetPins();
    this.model.set({_isAtLeastOneCorrectSelection: false});
  }

  resetPins() {
    _.each(this._pinViews, function(pin) {
      pin.reset();
    });
    this.placePins();
    this.model.set('_pinsPlaced', 0);
  }

  showCorrectAnswer() {
    const isDesktop = Adapt.device.screenSize !== 'small';
    const items = this.model.get('_items');
    const map = new Array(items.length);
    let free = [];
    let i = 0, l = 0, pin, zone;

    // map first correctly placed pin to item and log other pins as free for moving
    _.each(this._pinViews, function(pin, pinIndex) {
      const pos = pin.getPosition();
      if (pos) {
        const itemIndex = this.model.getIndexOfItem(pos.percentX, pos.percentY);
        if (itemIndex !== -1 && !map[itemIndex]) map[itemIndex] = true;
        else free.push(pin);
      }
    }, this);

    // ensure every item has a pin
    for (l=items.length; i<l; i++) {
      if (!map[i]) {
        zone = isDesktop ? items[i].desktop : items[i].mobile;
        pin = free.shift();
        pin.setPosition(zone.left+zone.width/2, zone.top+zone.height/2);
      }
    }

    // remove any superfluous pins
    for (i=l, l=this._pinViews.length; i<l; i++) {
      pin = this._pinViews[i];
      pin.reset();
    }

    this.updatePinPositions();
  }

  hideCorrectAnswer() {
    const userAnswer = this.model.get('_userAnswer');
    let i = 1, l = 0, pin;

    for (l=userAnswer.length; i<l; i+=2) {
      pin = this._pinViews[(i-1) >> 1];
      pin.setPosition(userAnswer[i]/100, userAnswer[i+1]/100);
    }

    for (i=userAnswer.length-1 >> 1, l=this._pinViews.length; i<l; i++) {
      pin = this._pinViews[i];
      pin.reset();
    }

    this.updatePinPositions();
  }

  onDragStart(pin, event) {
    //console.log('Drag Start');
  }

  onDragEnd(pin, event) {
    const $pinboard = this.$('.ppq-pinboard');
    const boardw = $pinboard.width();
    const boardh = $pinboard.height();
    const pos = pin.$el.position();
    const x = pos.left + pin.$el.width() / 2;
    const y = pos.top + pin.$el.height() / 2;
    const percentX = 100 * x / boardw;
    const percentY = 100 * y / boardh;

    pin.setPosition(percentX, percentY);
    this.checkCompletionStatus();
  }

  checkCompletionStatus() {
    if (this.$('.ppq-pin.in-use').length == this.model.get('_maxSelection')) {
      this.model.set('_pinsPlaced', this.model.get('_maxSelection'));
      this.model.checkCanSubmit();
    }

    if (this.$('.ppq-pin.in-use').length >= this.model.get('_minSelection')) {
      this.model.checkCanSubmit();
    }
  }
  onHotspotActivated(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.getAttribute('data-index'));
    this.placePinOnHotspot(index);
  }

  onHotspotKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  }

  placePinOnHotspot(index) {
    const pin = this.getNextUnusedPin();
    if (!pin || this.$('.component__widget').hasClass('is-disabled')) return;

    const item = this.model.get('_items')[index];
    const isDesktop = Adapt.device.screenSize !== 'small';
    const coords = isDesktop ? item.desktop : item.mobile;

    const percentX = coords.left + (coords.width / 2);
    const percentY = coords.top + (coords.height / 2);

    pin.setPosition(percentX, percentY);

    const $pinboard = this.$('.ppq-pinboard');
    const boardw = $pinboard.width();
    const boardh = $pinboard.height();

    pin.$el.css({
      left: boardw * percentX / 100 - pin.$el.width() / 2,
      top: boardh * percentY / 100 - pin.$el.height() / 2
    });

    this.checkCompletionStatus();
  }
}

PpqView.template = 'ppq';

export default PpqView;