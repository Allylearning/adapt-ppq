import Adapt from 'core/js/adapt';

export default class PinView extends Backbone.View {

  tagName() {
    return 'div';
  }

  className() {
    return 'ppq-pin';
  }

  events() {
    return {
      'click .ppq-icon':'preventDefault'
    };
  }

  initialize() {
    this.state = new Backbone.Model();
    this.render();
    this.$el.attr('aria-hidden', 'true');
  }

  render() {
    const template = Handlebars.templates['ppqPin'];

    this.$el.html(template());
  }

  preventDefault(event) {
    event.preventDefault();
  }

  reset() {
    this.$el.removeClass('in-use correct incorrect');
    this.state.unset('position');
  }

  getPosition() {
    return this.state.get('position');
  }

  setPosition(percentX, percentY) {
    if (!this.isGraphable(percentX) || !this.isGraphable(percentY)) return;

    this.$el.addClass('in-use');
    this.state.set('position', {
      'percentX':percentX,
      'percentY':percentY
    });
  }

  isGraphable(o) {
    return _.isNumber(o) && !isNaN(o) && isFinite(o);
  }
}
