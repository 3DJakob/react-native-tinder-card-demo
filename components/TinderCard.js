/* global WebKitCSSMatrix */
import React, { useState } from "react";
import { View, PanResponder, Text, Dimensions } from "react-native";
import { useSpring, animated, interpolate } from "react-spring/native";
const { height, width } = Dimensions.get("window");

const settings = {
  rotationModifier: 15,
  rotationPower: 50,
  swipeThreshold: 1.5, // need to update this threshold for RN (1.5 seems reasonable...?)
};

// physical properties of the spring
const physics = {
  touchResponsive: {
    friction: 50,
    tension: 800,
  },
  animateOut: {
    friction: 50,
    tension: 800,
  },
};

const pythagoras = (x, y) => {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

const animateOut = async (gesture, set, easeIn = false) => {
  const diagonal = pythagoras(height, width);

  const velocity = pythagoras(gesture.vx, gesture.vy);
  const time = diagonal / velocity;
  const multiplier = diagonal / velocity; // needs to be adjusted as current way velocity is measured is unclear.
  // calculate rotation of the element
  // don't need to read the current rotation value.
  // useSpring animates all frames between initial rotation state and final rotation state.
  const finalX = multiplier * gesture.vx;
  const finalY = multiplier * gesture.vy;
  const finalRotationState = (gesture.vx * multiplier) / settings.rotationModifier;
  console.log("multiplier:", multiplier);
  console.log("velocity:", velocity);
  console.log("finalRotation:", finalRotationState);
  console.log("x", finalX);
  console.log("y", finalY);
  set({
    x: finalX,
    y: finalY,
    rot: finalRotationState, // set final rotation value based on gesture.vx
    config: physics.animateOut,
  });

  // element.style.transform = translateString + rotateString;
  // for now animate back
  await new Promise((resolve) =>
    setTimeout(() => {
      animateBack(set);
      resolve();
    }, 1000)
  );
};

const animateBack = (set) => {
  // translate back to the initial position
  set({ x: 0, y: 0, rot: 0, config: physics.touchResponsive });
};

const getSwipeDirection = (speed) => {
  if (Math.abs(speed.x) > Math.abs(speed.y)) {
    return speed.x > 0 ? "right" : "left";
  } else {
    return speed.y > 0 ? "down" : "up";
  }
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

    const [{ x, y, rot }, set] = useSpring(() => ({
      x: 0,
      y: 0,
      rot: 0,
      config: physics.touchResponsive,
    }));

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
            console.log("touch down!");
          },
          onPanResponderMove: (evt, gestureState) => {
            // The most recent move distance is gestureState.move{X,Y}
            const newLocation = {
              x: gestureState.dx,
              y: gestureState.dy,
              time: new Date().getTime(),
            };
            // use guestureState.vx / guestureState.vy for velocity calculations
            setSpeed({ x: gestureState.vx, y: gestureState.vy });
            setLastLocation(newLocation);
            // translate element
            const rot = ((2 * gestureState.dx) / width) * settings.rotationModifier;
            set({ x: gestureState.dx, y: gestureState.dy, rot });
          },
          onPanResponderTerminationRequest: (evt, gestureState) => {
            console.log("terminate req");
            return true;
          },
          onPanResponderRelease: (evt, gestureState) => {
            // The user has released all touches while this view is the
            // responder. This typically means a gesture has succeeded
            console.log("touch up");
            // enable
            handleSwipeReleased(set, gestureState);
          },
        }),
      []
    );
    return (
      <AnimatedView
        {...panResponder.panHandlers}
        style={{
          transform: [
            { translateX: x },
            { translateY: y },
            { rotate: rot.interpolate((rot) => `${rot}deg`) },
          ],
        }}
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
