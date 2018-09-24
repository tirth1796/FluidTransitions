import { StyleSheet } from 'react-native';


function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0); }

const mergeStyles = (styles: Array<any>): StyleSheet.NamedStyles => {
  const retVal = { transform: [] };
  styles.forEach((style) => {
    if (style) {
      let flattenedStyle = style;
      if (isNumber(flattenedStyle)) { flattenedStyle = StyleSheet.flatten(flattenedStyle); }
      Object.keys(flattenedStyle).forEach((key) => {
        if (flattenedStyle[key] && flattenedStyle[key] instanceof Array) {
          const a = flattenedStyle[key];
          if (!retVal[key]) retVal[key] = [];
          a.forEach(i => retVal[key].push(i));
        } else if (flattenedStyle[key]) {
          retVal[key] = flattenedStyle[key];
        }
      });
    }
  });

  return retVal;
};

export { mergeStyles };
