import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';
import './Counter.css';

function NumberDigit({ mv, number, height }) {
  const y = useTransform(mv, (latest) => {
    const num = Number(latest) || 0;
    const placeValue = ((num % 10) + 10) % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  return (
    <motion.span className="counter-number" style={{ y }}>
      {number}
    </motion.span>
  );
}

function normalizeNearInteger(num) {
  const nearest = Math.round(num);
  const tolerance = 1e-9 * Math.max(1, Math.abs(num));
  return Math.abs(num - nearest) < tolerance ? nearest : num;
}

function getValueRoundedToPlace(value, place) {
  const scaled = value / (place || 1);
  return Math.floor(normalizeNearInteger(scaled));
}

function Digit({ place, value, height, digitStyle }) {
  const isDecimal = place === '.';
  const valueRoundedToPlace = isDecimal ? 0 : getValueRoundedToPlace(value, place);
  const motionVal = useMotionValue(valueRoundedToPlace);
  const animatedValue = useSpring(motionVal, { stiffness: 85, damping: 18 });

  useEffect(() => {
    if (!isDecimal) {
      motionVal.set(valueRoundedToPlace);
    }
  }, [motionVal, valueRoundedToPlace, isDecimal]);

  if (isDecimal) {
    return (
      <span className="counter-digit" style={{ height, ...digitStyle, width: 'fit-content' }}>
        .
      </span>
    );
  }

  return (
    <span className="counter-digit" style={{ height, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <NumberDigit key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </span>
  );
}

export default function Counter({
  value = 0,
  fontSize = 16,
  padding = 0,
  places,
  gap = 2,
  borderRadius = 4,
  horizontalPadding = 2,
  textColor = 'inherit',
  fontWeight = 'inherit',
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 4,
  gradientFrom = 'transparent',
  gradientTo = 'transparent',
  topGradientStyle,
  bottomGradientStyle
}) {
  const val = Number(value) || 0;
  const str = Math.abs(Math.round(val)).toString();

  const computedPlaces = places || [...str].map((ch, i, a) => {
    if (ch === '.') return '.';
    const power = a.indexOf('.') === -1 ? a.length - i - 1 : i < a.indexOf('.') ? a.indexOf('.') - i - 1 : -(i - a.indexOf('.'));
    return 10 ** power;
  });

  const height = fontSize + padding;
  const defaultCounterStyle = {
    fontSize,
    gap,
    borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    color: textColor,
    fontWeight,
    direction: "ltr"
  };
  const defaultTopGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`
  };
  const defaultBottomGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`
  };

  return (
    <span className="counter-container" style={containerStyle}>
      <span className="counter-counter" style={{ ...defaultCounterStyle, ...counterStyle }}>
        {computedPlaces.map((place, idx) => (
          <Digit key={`${place}-${idx}`} place={place} value={val} height={height} digitStyle={digitStyle} />
        ))}
      </span>
      <span className="gradient-container">
        <span className="top-gradient" style={topGradientStyle || defaultTopGradientStyle} />
        <span className="bottom-gradient" style={bottomGradientStyle || defaultBottomGradientStyle} />
      </span>
    </span>
  );
}
