/* global WebKitCSSMatrix */
import React, { useState } from "react";
import { View, PanResponder, Text, Dimensions } from "react-native";
import { useSpring, animated, interpolate, config } from "react-spring";

const settings = {
  snapBackDuration: 300,
  maxTilt: 5,
  bouncePower: 0.2,
  swipeThreshold: 1.5, // need to update this threshold for RN (1.5 seems reasonable...?)
};

const getElementSize = (element) => {
  const elementStyles = window.getComputedStyle(element);
  const widthString = elementStyles.getPropertyValue("width");
  const width = Number(widthString.split("px")[0]);
  const heightString = elementStyles.getPropertyValue("height");
  const height = Number(heightString.split("px")[0]);
  return { x: width, y: height };
};

const pythagoras = (x, y) => {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

const animateOut = async (gesture, set, easeIn = false) => {
  const startPos = { x: 0, y: 0 };
  const speed = { x: gesture.vx, y: gesture.vy };
  const { height, width } = Dimensions.get("window");
  const diagonal = pythagoras(height, width);

  const velocity = pythagoras(gesture.vx, gesture.vy);
  const time = diagonal / velocity;
  const multiplier = diagonal / velocity; // needs to be adjusted as current way velocity is measured is confusing.
  console.log("multiplier:", multiplier);

  // const translateString = translationString(
  //   speed.x * multiplier + startPos.x,
  //   -speed.y * multiplier + startPos.y
  // );
  const rotationPower = 200;

  // if (easeIn) {
  //   element.style.transition = "ease " + time + "s";
  // } else {
  //   element.style.transition = "ease-out " + time + "s";
  // }

  // if (getRotation(element) === 0) {
  //   rotateString = rotationString((Math.random() - 0.5) * rotationPower);
  // } else if (getRotation(element) > 0) {
  //   rotateString = rotationString((Math.random() * rotationPower) / 2 + getRotation(element));
  // } else {
  //   rotateString = rotationString(((Math.random() - 1) * rotationPower) / 2 + getRotation(element));
  // }
  console.log("velocity:", velocity);
  set({
    x: (multiplier * gesture.vx) / 2,
    y: (multiplier * gesture.vy) / 2,
    config: { friction: 50, tension: 100 * velocity },
  });
  // element.style.transform = translateString + rotateString;

  await await new Promise((resolve) => setTimeout(() => resolve(), 1000));
};

const animateBack = (set) => {
  // translate back to the initial position
  set({ x: 0, y: 0 });
  // element.style.transition = settings.snapBackDuration + "ms";
  // const startingPoint = getTranslate(element);
  // const translation = translationString(
  //   startingPoint.x * -settings.bouncePower,
  //   startingPoint.y * -settings.bouncePower
  // );
  // const rotation = rotationString(getRotation(element) * -settings.bouncePower);
  // element.style.transform = translation + rotation;
  // setTimeout(() => {
  //   element.style.transform = "none";
  // }, settings.snapBackDuration * 0.75);

  // setTimeout(() => {
  //   element.style.transition = "10ms";
  // }, settings.snapBackDuration);
};

const getSwipeDirection = (speed) => {
  if (Math.abs(speed.x) > Math.abs(speed.y)) {
    return speed.x > 0 ? "right" : "left";
  } else {
    return speed.y > 0 ? "up" : "down";
  }
};

const dragableTouchmove = (coordinates, element, offset, lastLocation) => {
  const pos = { x: coordinates.x + offset.x, y: coordinates.y + offset.y };
  const newLocation = { x: pos.x, y: pos.y, time: new Date().getTime() };
  const translation = translationString(pos.x, pos.y);
  const rotCalc = calcSpeed(lastLocation, newLocation).x / 1000;
  const rotation = rotationString(rotCalc * settings.maxTilt);
  element.style.transform = translation + rotation;
  return newLocation;
};

const touchCoordinatesFromEvent = (e) => {
  return { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
};

const mouseCoordinatesFromEvent = (e) => {
  return { x: e.clientX, y: e.clientY };
};

// must be created outside of the TinderCard forwardRef
const AnimatedView = animated(View);

const TinderCard = React.forwardRef(
  (
    { flickOnSwipe = true, children, onSwipe, onCardLeftScreen, className, preventSwipe = [] },
    ref
  ) => {
    const [lastLocation, setLastLocation] = useState({ x: 0, y: 0 });
    const [speed, setSpeed] = useState({ x: 0, y: 0, time: new Date().getTime() });

    const [{ x, y }, set] = useSpring(() => ({
      x: 0,
      y: 0,
      config: { friction: 50, tension: 800 },
    }));
    const element = React.useRef();
    // const { x, y, size } = useSpring({
    //   x: down ? delta[0] : 0,
    //   bg: `linear-gradient(120deg, ${
    //     delta[0] < 0 ? "#f093fb 0%, #f5576c" : "#96fbc4 0%, #f9f586"
    //   } 100%)`,
    //   size: down ? 1.1 : 1,
    //   immediate: (name) => down && name === "x",
    // });

    React.useImperativeHandle(ref, () => ({
      async swipe(dir = "right") {
        if (onSwipe) onSwipe(dir);
        const power = 1000;
        const disturbance = (Math.random() - 0.5) * 100;
        if (dir === "right") {
          await animateOut(element.current, { x: power, y: disturbance }, true);
        } else if (dir === "left") {
          await animateOut(element.current, { x: -power, y: disturbance }, true);
        } else if (dir === "up") {
          await animateOut(element.current, { x: disturbance, y: power }, true);
        } else if (dir === "down") {
          await animateOut(element.current, { x: disturbance, y: -power }, true);
        }
        element.current.style.display = "none";
        if (onCardLeftScreen) onCardLeftScreen(dir);
      },
    }));

    const handleSwipeReleased = React.useCallback(
      async (set, gesture) => {
        // Check if this is a swipe
        if (
          Math.abs(gesture.vx) > settings.swipeThreshold ||
          Math.abs(gesture.vy) > settings.swipeThreshold
        ) {
          const dir = getSwipeDirection({ x: gesture.vx, y: gesture.vy });
          console.log("direction", dir);
          // if (onSwipe) onSwipe(dir);

          if (flickOnSwipe) {
            if (!preventSwipe.includes(dir)) {
              await animateOut(gesture, set);
              // element.style.display = "none";
              if (onCardLeftScreen) onCardLeftScreen(dir);
              return;
            }
          }
        }

        // Card was not flicked away, animate back to start
        animateBack(set);
      },
      [flickOnSwipe, onSwipe, onCardLeftScreen, preventSwipe]
    );

    const panResponder = React.useMemo(
      () =>
        PanResponder.create({
          // Ask to be the responder:
          onStartShouldSetPanResponder: (evt, gestureState) => true,
          onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
          onMoveShouldSetPanResponder: (evt, gestureState) => true,
          onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

          onPanResponderGrant: (evt, gestureState) => {
            // The gesture has started.
            // Probably wont need this anymore as postion i relative to swipe!
            console.log("press in");
          },
          onPanResponderMove: (evt, gestureState) => {
            // The most recent move distance is gestureState.move{X,Y}
            const newLocation = {
              x: gestureState.dx,
              y: gestureState.dy,
              time: new Date().getTime(),
            };
            // use guestureState to derive planar velocities
            setSpeed({ x: gestureState.vx, y: gestureState.vy });
            setLastLocation(newLocation);
            // translate element
            set({ x: gestureState.dx, y: gestureState.dy });
          },
          onPanResponderTerminationRequest: (evt, gestureState) => {
            console.log("terminate req");
            return true;
          },
          onPanResponderRelease: (evt, gestureState) => {
            // The user has released all touches while this view is the
            // responder. This typically means a gesture has succeeded
            console.log("press out");
            // enable
            handleSwipeReleased(set, gestureState);
          },
        }),
      []
    );

    //   TODO Implement these events! using the panResponder!

    // element.current.addEventListener(('touchmove'), (ev) => {
    //   ev.preventDefault()
    //   const newLocation = dragableTouchmove(touchCoordinatesFromEvent(ev), element.current, offset, lastLocation)
    //   speed = calcSpeed(lastLocation, newLocation)
    //   lastLocation = newLocation
    // })

    // element.current.addEventListener(('touchend'), (ev) => {
    //   ev.preventDefault()
    //   handleSwipeReleased(element.current, speed)
    // })
    return (
      <AnimatedView
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX: x }, { translateY: y }] }}
      >
        <Text>
          Location: x: {Math.round(lastLocation.x)} y: {Math.round(lastLocation.y)}
        </Text>
        <Text>
          Speed: x: {Math.round(speed.x * 10) / 10} y: {Math.round(speed.y * 10) / 10}
        </Text>
        {children}
      </AnimatedView>
    );
  }
);

// module.exports = TinderCard
export default TinderCard;
