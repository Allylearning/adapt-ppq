import Adapt from 'core/js/adapt';
import QuestionModel from 'core/js/models/questionModel';

export default class PpqModel extends QuestionModel {

  init() {
    super.init();

    this.set('_pinsPlaced', 0);
    this.checkCanSubmit();
  }

  setScore() {
    const questionWeight = this.get('_questionWeight');
    const answeredCorrectly = this.get('_isCorrect');
    const score = answeredCorrectly ? questionWeight : 0;
    this.set('_score', score);
  }

  restoreUserAnswers() {
    if (!this.get('_isSubmitted')) return;

    this.setQuestionAsSubmitted();
    this.markQuestion();
    this.setScore();
    this.setupFeedback();
  }

  canSubmit() {
    const canSubmit = this.get('_pinsPlaced') == this.get('_maxSelection');
    return canSubmit;
  }

  isCorrect() {
    const items = this.get('_items');
    const userAnswer = this.get('_userAnswer');
    const isDesktop = userAnswer[0];
    const map = new Array(items.length);

    for (let i=1, l=userAnswer.length; i<l; i+=2) {
      const itemIndex = this.getIndexOfItem(userAnswer[i]/100, userAnswer[i+1]/100, isDesktop);
      const item = this.get('_items')[itemIndex];

      if (itemIndex != -1) {
        map[itemIndex] = true;
        item._isCorrect = 1;
      }
    }

    this.get('_isAtLeastOneCorrectSelection', _.indexOf(map, true) !== -1);

    return _.compact(map).length === items.length;
  }

  isPartlyCorrect() {
    return this.get('_isAtLeastOneCorrectSelection');
  }

  resetUserAnswer() {
    this.set({ _userAnswer: [] });

    this.get('_items').forEach((item, index) => {
      item._isCorrect = 0;
    });
  }

  /**
  * Used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
  * @return {string} the user's answers as a string in the format "1.1#2.3#3.2" assuming user selected option 1 in drop-down 1,
  * option 3 in drop-down 2 and option 2 in drop-down 3. The '#' character will be changed to either ',' or '[,]' by adapt-contrib-spoor,
  * depending on which SCORM version is being used.
  */
  getResponse() {
    const items = this.get('_items');
    const selectedIndexes = _.pluck(items, '_isCorrect');
    let responses = [];

    for (let i = 0, count = items.length; i < count; i++) {
      responses.push((i + 1) + "." + (selectedIndexes[i])); // convert from 0-based to 1-based counting
    };

    return responses.join('#');
  }

  /**
  * Used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
  * @return {string}
  */
  getResponseType() {
    return 'matching';
  }

  // given a coordinate return the index of the containing item if found
  getIndexOfItem(x, y, desktop) {
    const isDesktop = _.isBoolean(desktop) ? desktop : Adapt.device.screenSize !== 'small';
    const items = this.get('_items');

    for (let i=0, l=items.length; i<l; i++) {
      const zone = isDesktop ? items[i].desktop : items[i].mobile;
      if (x >= zone.left && y >= zone.top && x < zone.left+zone.width && y < zone.top+zone.height) {
        return i;
      }
    }
    return -1;
  }
}
