import React from 'react'

export const StateColocation = () => {
  // this is "global state"
  const [dog, setDog] = React.useState('')
  const [time, setTime] = React.useState(200)
  return (
    <div>
      <DogName time={time} dog={dog} onChange={setDog} />
      <SlowComponent time={time} onChange={setTime} />
    </div>
  )
}

function sleep(time) {
  const done = Date.now() + time
  while (done > Date.now()) {
    // sleep...
  }
}

// imagine that this slow component is actually slow because it's rendering a
// lot of data (for example).
function SlowComponent({ time, onChange }) {
  sleep(time)
  return (
    <div>
      Wow, that was{' '}
      <input
        value={time}
        type="number"
        onChange={(e) => onChange(Number(e.target.value))}
      />
      ms slow
    </div>
  )
}

function DogName({ time, dog, onChange }) {
  return (
    <div>
      <label htmlFor="dog">Dog Name</label>
      <br />
      <input id="dog" value={dog} onChange={(e) => onChange(e.target.value)} />
      <p>{dog ? `${dog}'s favorite number is ${time}.` : 'enter a dog name'}</p>
    </div>
  )
}
