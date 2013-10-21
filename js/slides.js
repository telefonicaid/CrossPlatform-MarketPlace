'use strict';

var CompactSlide = (function() {

  var EVENT_NAMESPACE = 'compactslide';

  function NavigationModel(slides) {
    this.currentSlideNumber = 0;
    this.slideCount = slides.length;
    this.steppingToTarget = 0;
  }

  NavigationModel.prototype.goToSlide = function(targetSlideNumber) {
    if (targetSlideNumber < 1 || targetSlideNumber > this.slideCount) {
      return;
    }
    var forward = targetSlideNumber > this.currentSlideNumber;
    var steps = Math.abs(targetSlideNumber - this.currentSlideNumber);
    this.goToSlideStepByStep(steps, forward);
  };

  NavigationModel.prototype.goToSlideStepByStep = function(steps, forward) {
    var self = this;
    function nextStep() {
      if (forward) {
        self.nextSlide();
      }
      else {
        self.previousSlide();
      }
      steps--;
      if (steps) {
        self.steppingToTarget = setTimeout(nextStep, 200);
      }
    }

    clearTimeout(this.steppingToTarget);
    nextStep();
  }

  NavigationModel.prototype.nextSlide = function() {
    if (!this.isEnd) {
      this.currentSlideNumber++;
      this.emit(
        EVENT_NAMESPACE + ':slidechange',
        { forward: true,
          from: this.currentSlideNumber - 1 , to: this.currentSlideNumber }
      );
    }
  };

  Object.defineProperty(NavigationModel.prototype, 'isEnd', {
    get: function () {
      return this.currentSlideNumber === this.slideCount;
    }
  });

  NavigationModel.prototype.previousSlide = function() {
    if (!this.isBegin) {
      this.currentSlideNumber--;
      this.emit(
        EVENT_NAMESPACE + ':slidechange',
        { backward: true,
          from: this.currentSlideNumber + 1 , to: this.currentSlideNumber }
      );
    }
  };

  Object.defineProperty(NavigationModel.prototype, 'isBegin', {
    get: function () {
      return this.currentSlideNumber === 1;
    }
  });

  NavigationModel.prototype.emit = function(type, detail) {
    var syncEvent = new CustomEvent(type, { detail: detail });
    window.dispatchEvent(syncEvent);
  }

  function NavigationRender(model, slides) {
    this.model = model;
    this.slides = slides;

    this.setupSlides();
    this.setupNavigationButtons();

    var self = this;
    window.addEventListener(EVENT_NAMESPACE + ':slidechange', function (evt) {
      self.updateNavigation(evt.detail);
    });
  }

  NavigationRender.prototype.setupSlides = function () {
    this.slides.forEach(function onEachSlide(slide) {
      slide.dataset.viewport = 'right';
    });
  }

  NavigationRender.prototype.setupNavigationButtons = function () {
    this.nextSlideButton = document.getElementById('next-slide-button');
    this.previousSlideButton = document.getElementById('previous-slide-button');
  };

  NavigationRender.prototype.updateNavigation = function (detail) {
    this.updateSlides(detail);
    this.updateNavigationButtons();
  };

  NavigationRender.prototype.updateSlides = function (detail) {
    var currentSlide = this.slides[detail.to - 1],
        previousSlide = this.slides[detail.from - 1];

    delete currentSlide.dataset.viewport;
    if (previousSlide) {
      if ('forward' in detail) {
        previousSlide.dataset.viewport = 'left';
      }
      else if ('backward' in detail) {
        previousSlide.dataset.viewport = 'right';
      }
    }
  }

  NavigationRender.prototype.updateNavigationButtons = function() {
    var isEnd = this.nextSlideButton.disabled = this.model.isEnd;
    isEnd ? this.nextSlideButton.classList.remove('recommend') :
            this.nextSlideButton.classList.add('recommend');

    var isBegin = this.previousSlideButton.disabled = this.model.isBegin;
    isBegin ? this.previousSlideButton.classList.remove('recommend') :
              this.previousSlideButton.classList.add('recommend');
  }

  function NavigationControl(model) {
    this.model = model;

    this.setupNavigationArrows();
    this.setupNavigationButtons();
    this.setupHashControl();
  }

  NavigationControl.prototype.setupNavigationArrows = function () {
    var self = this;
    var RIGHT_ARROW = 39, LEFT_ARROW = 37;
    window.addEventListener('keypress', function (evt) {
      var keycode = evt.keyCode;
      switch(keycode) {
        case RIGHT_ARROW:
          evt.preventDefault();
          self.navigateToNextSlide();
          break;
        case LEFT_ARROW:
          evt.preventDefault();
          self.navigateToPreviousSlide();
          break;
      }
    });
  }

  NavigationControl.prototype.setupNavigationButtons = function () {
    document.getElementById('next-slide-button').onclick =
      this.navigateToNextSlide.bind(this);

    document.getElementById('previous-slide-button').onclick =
      this.navigateToPreviousSlide.bind(this);
  };

  NavigationControl.prototype.setupHashControl = function () {
    var self = this;
    window.addEventListener('hashchange', function () {
      var targetSlide = parseInt(location.hash.split('/')[1], 10);
      self.model.goToSlide(targetSlide);
    });
    window.location.hash = '#';
  };

  NavigationControl.prototype.navigateToSlide = function (targetSlide) {
    window.location.hash = '#/' + targetSlide;
  }

  NavigationControl.prototype.navigateToNextSlide = function () {
    var targetSlide = this.model.currentSlideNumber + 1;
    this.navigateToSlide(targetSlide);
  };

  NavigationControl.prototype.navigateToPreviousSlide = function () {
    var targetSlide = this.model.currentSlideNumber - 1;
    this.navigateToSlide(targetSlide);
  };

  function init() {
    var slides = [].slice.call(document.getElementsByClassName('slide'));

    var theModel = new NavigationModel(slides);
    var theRender = new  NavigationRender(theModel, slides);
    var theControl = new NavigationControl(theModel);
    theControl.navigateToSlide(1);
  }

  return {
    init: init
  };
}());

CompactSlide.init();

window.scrollTo(0, 0);
