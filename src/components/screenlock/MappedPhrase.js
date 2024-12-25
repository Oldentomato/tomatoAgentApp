import { Char, Phrase } from "animatedtxt";

const packageName = [
  {
    char: "T",
    duration: 0.5
  },
  {
    char: "O",
    duration: 0.5
  },
  {
    char: "M",
    duration: 0.2
  },
  {
    char: "A" ,
    duration: 0.5
  },
  {
    char: "T" ,
    duration: 0.5
  },
  {
    char: "O",
    duration: 0.3
  },
  {
    char: "A",
    duration: 0.3
  },
  {
    char: "G",
    duration: 0.3
  },
  {
    char: "E",
    duration: 0.3
  },
  {
    char: "N" ,
    duration: 0.5
  },
  {
    char: "T" ,
    duration: 0.5
  }

];

const addDelay = (delayOffset) => {
  let sum = 0;
  return packageName.map((letter) => {
    const charWithDelay = { ...letter, delay: sum };
    sum += letter.duration + delayOffset;
    return charWithDelay;
  });
};

export default function MappedPhrase() {
  return (
    <Phrase
      margin={5}
      size={120}
      cubicBezier={[0.68, 0.04, 0.45, 0.98]}
      delay={0.2}
      color="#fff"
    >
      {addDelay(-0.1).map((letter, index) => (
        <Char
          key={index}
          char={letter.char}
          duration={letter.duration}
          delay={letter.delay}
        />
      ))}
    </Phrase>
  );
}
