# Rotating-Slider-jQuery-Plugin
A rotating slider that uses the Clip-path property to create a circular shape.  Note, because Internet Explorer/Edge do not support the Clip-path property, this will not work in those browsers.
Demo at https://codepen.io/tylernj42/full/vWdRxv/

## Usage

The basic HTML markup requires a container with the `.rotating-slider` class, a child `ul` element with the `.slides` class, and at least two children `li` elements.

```
<div class="rotating-slider">
  <ul class="slides">
    <li>
      <p>Slide 1</p>
    </li>
    <li>
      <p>Slide 2</p>
    </li>
  </ul>
</div>
```

The Rotating Slider is initialized by calling the rotatingSlider method like so: `$('.rotating-slider').rotatingSlider()`.
This method accepts a number of options, the defaults are below.

```
$('.rotating-slider').rotatingSlider({
  autoRotate: true,
  autoRotateInterval: 6000,
  draggable: true,
  directionControls: true,
  directionLeftText: '&lsaquo;',
  directionRightText: '&rsaquo;',
  rotationSpeed: 750,
  slideHeight : 360,
  slideWidth : 480,
});
```

Note that the `slideWidth` and `slideHeight` properties do not define the size of the overall slider, but instead define the size of the content area inside the slide.  The plugin will use these measurements to calculate an arc shape to create the illusion of a circular slider, and padding will be added to the slide to fit this shape.
