# adapt-ppq-audio  

**PPQ** is a *question component* for the [Adapt framework](https://github.com/adaptlearning/adapt_framework).  

The component requires users to correctly position one or more pins on an image. Upon submission, feedback is provided via the [**Tutor** extension](https://github.com/adaptlearning/adapt-contrib-tutor), if installed. Feedback can be provided for correct, incorrect and partially correct answers. The number of attempts allowed may be configured.  

## Installation

This extension must be manually installed.  

If **PPQ** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).  

## Settings Overview

The attributes listed below are used in *components.json* to configure **PPQ**, and are properly formatted as JSON in [*example.json*](https://github.com/deltanet/adapt-ppq/blob/master/example.json).

### Attributes

In addition to the attributes specifically listed below, [*question components*](https://github.com/adaptlearning/adapt_framework/wiki/Core-Plug-ins-in-the-Adapt-Learning-Framework#question-components) can implement the following sets of attributes:   
+ [**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. They have no default values. Like the attributes below, their values are assigned in *components.json*.
+ [**core buttons**](https://github.com/adaptlearning/adapt_framework/wiki/Core-Buttons): Default values are found in *course.json*, but may be overridden by **PPQ's** model in *components.json*.

**_component** (string): This value must be: `ppq`.  

**_classes** (string): CSS class name to be applied to **PPQ**’s containing `div`. The class must be predefined in one of the Less files. Separate multiple classes with a space.  

**_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.  

**instruction** (string): This optional text appears above the component. It is frequently used to guide the learner’s interaction with the component.  

**_attempts** (number): This specifies the number of times a learner is allowed to submit an answer. The default is `1`.   

**_shouldDisplayAttempts** (boolean): Determines whether or not the text set in **remainingAttemptText** and **remainingAttemptsText** will be displayed. These two attributes are part of the [core buttons](https://github.com/adaptlearning/adapt_framework/wiki/Core-Buttons) attribute group. The default is `false`.  

**_isRandom** (boolean): Setting this value to `true` will cause the possible answers associated with each *item* to appear in a random order each time the component is loaded. The default is `false`.   

**_questionWeight** (number): A number which reflects the significance of the question in relation to the other questions in the course. This number is used in calculations of the final score reported to the LMS.  

**_canShowModelAnswer** (boolean): Setting this to `false` prevents the [**_showCorrectAnswer** button](https://github.com/adaptlearning/adapt_framework/wiki/Core-Buttons) from being displayed. The default is `true`.

**_canShowFeedback** (boolean): Setting this to `false` disables feedback, so it is not shown to the user. The default is `true`.

**_canShowMarking** (boolean): Setting this to `false` prevents ticks and crosses being displayed on question completion. The default is `true`.

**_recordInteraction** (boolean) Determines whether or not the learner's answers will be recorded to the LMS via cmi.interactions. Default is `true`. For further information, see the entry for `_shouldRecordInteractions` in the README for [adapt-contrib-spoor](https://github.com/adaptlearning/adapt-contrib-spoor).

**_developerMode** (boolean): This can be used to show the correct hotspot locations. Useful for when developing the content.    

**_resetPinsOnPinboardChange** (boolean): Set to `true` if the image content/aspect ratio varies between the desktop and mobile pinboards. If the user completes the question on one pinboard (e.g. desktop) and later attempts to view the question on the other pinboard (e.g. mobile) a message will be displayed in place of the pinboard. This message can be configured in `course.json` via the `_globals._components._ppq.otherDeviceCompletionMessage` property.    

**_showPinsOnLoad** (boolean): This can be used to show the pins to the user when the component loads.    

**_pinboardDesktop** (object): This attribute group stores the properties for the background graphic on large devices. It contains values for **src**, **alt**, and **title**.  

>**src** (string): File name (including path) of the image.  

>**alt** (string): This text becomes the image’s `alt` attribute.  

>**title** (string): This text becomes the image’s `title` attribute.  

**_pinboardMobile** (object): This attribute group stores the properties for the background graphic on small devices. It contains values for **src**, **alt**, and **title**.  

>**src** (string): File name (including path) of the image.  

>**alt** (string): This text becomes the image’s `alt` attribute.  

>**title** (string): This text becomes the image’s `title` attribute.  

**_items** (array): Multiple items may be created. Each *item* represents a hotspot on the graphic. It contains values for **desktop** and **mobile**.  

>**desktop** (object): This attribute group stores the properties for the hotspot on large devices. It contains values for **left**, **top**, **width**, and **height**.  

>>**left** (number): Defines the left position of the hotspot as a percentage.  

>>**top** (number): Defines the top position of the hotspot as a percentage.  

>>**width** (number): Defines the width of the hotspot in pixels.  

>>**height** (number): Defines the height of the hotspot in pixels.  

>**mobile** (object): This attribute group stores the properties for the hotspot on small devices. It contains values for **left**, **top**, **width**, and **height**.  

>>**left** (number): Defines the left position of the hotspot as a percentage.  

>>**top** (number): Defines the top position of the hotspot as a percentage.  

>>**width** (number): Defines the width of the hotspot in pixels.  

>>**height** (number): Defines the height of the hotspot in pixels.

**_feedback** (object): If the [**Tutor** extension](https://github.com/adaptlearning/adapt-contrib-tutor) is enabled, these various texts will be displayed depending on the submitted answer. **_feedback** contains values for three types of answers: **correct**, **_incorrect**, and **_partlyCorrect**. Some attributes are optional. If they are not supplied, the default that is noted below will be used.  

>**correct** (string): Text that will be displayed when the submitted answer is correct.  

>**_incorrect** (object): Texts that will be displayed when the submitted answer is incorrect. It contains values that are displayed under differing conditions: **final** and **notFinal**.

>>**final** (string): Text that will be displayed when the submitted answer is incorrect and no more attempts are permitted.

>>**notFinal** (string): Text that will be displayed when the submitted answer is incorrect while more attempts are permitted. This is optional&mdash;if you do not supply it, the **_incorrect.final** feedback will be shown instead.

>**_partlyCorrect** (object): Texts that will be displayed when the submitted answer is partially correct. It contains values that are displayed under differing conditions: **final** and **notFinal**.

>>**final** (string): Text that will be displayed when the submitted answer is partly correct and no more attempts are permitted. This is optional&mdash;if you do not supply it, the **_incorrect.final** feedback will be shown instead.

>>**notFinal** (string): Text that will be displayed when the submitted answer is partly correct while more attempts are permitted. This is optional&mdash;if you do not supply it, the **_incorrect.notFinal** feedback will be shown instead.

### Accessibility
**PPQ** has been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **ariaRegion**. This label is not a visible element. It is utilized by assistive technology such as screen readers. Should the region's text need to be customised, it can be found within the **globals** object in [*properties.schema*](https://github.com/deltanet/adapt-ppq/blob/master/properties.schema).   
<div float align=right><a href="#top">Back to Top</a></div>

## Limitations  

No known limitations.

----------------------------
**Framework versions:** 5.8+  
**Author / maintainer:** CGKineo / DeltaNet  
**Accessibility support:** WAI AA   
**RTL support:** yes  
**Cross-platform coverage:** TBC  
**Authoring tool support:** yes  
