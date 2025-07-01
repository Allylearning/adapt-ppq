import Adapt from 'core/js/adapt';
import PpqView from './ppqView';
import PpqModel from './ppqModel';

export default Adapt.register('ppq-audio', {
  view: PpqView,
  model: PpqModel
});
