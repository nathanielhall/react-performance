# React Performance Notes

> Below are notes taken while researching 'React Performance' over the past
> quarter. All resources used are posted at the bottom of the page. This
> includes many articles, videos, and tutorials.

## Topics

- Code Splitting
- Unnecessary Renders
- Expensive Calculations / Slow Renders
- Virtualization for Long Lists
- State Management effect on Performance
  - Fix "perf death by a thousand cuts"
  - Optimize Context/Redux
- Tools for Measuring Performance
- Definitions
- Resources

## Overview

- Performance optimizations have a cost and are intended for special cases only

## Code Splitting

- [Code Splitting](https://reactjs.org/docs/code-splitting.html) is a feature
  which can create multiple bundles that can be dynamically loaded at runtime.

- Code-splitting your app can help you “lazy-load” just the things that are
  currently needed by the user, and reducing the amount of code needed during
  the initial load.

```js
import('/some-module.js').then(
  (module) => {
    // do stuff with the module's exports
  },
  (error) => {
    // there was some error loading the module...
  }
)
```

- React has built-in support for loading modules as React components.

```js
const LineChart = React.lazy(() => import('./line-chart'))

function App() {
 return (
   <div>
     <React.Suspense fallback={<div>loading...</div>}>
       <LineChart />
     </React.Suspense>
   </div>
 )
```

- Tools to help determine need/benefit of code splitting

  - Dev tools "Coverage" feature

    <img src="https://developers.google.com/web/tools/chrome-devtools/coverage/images/example.png" width="600">

  - Webpack Bundle Analyzer

    <img src="https://cloud.githubusercontent.com/assets/302213/20628702/93f72404-b338-11e6-92d4-9a365550a701.gif" width="600">

  - Webpack
    [Prefetching/Preloading](https://webpack.js.org/guides/code-splitting/#prefetchingpreloading-modules)
    Modules
    - prefetch: resource is probably needed for some navigation in the future
    - preload: resource will also be needed during the current navigation
    - [Magic Comments](https://webpack.js.org/api/module-methods/#magic-comments)

```js
import(/* webpackPrefetch: true */ './path/to/LoginModal.js')
```

```js
<link rel="prefetch" href="login-modal-chunk.js">
```

## Unecessary Renders

- Most of the time re-renders are fine and do not cause performance issues
- When a performance issue exists, much of the time it's related to unecessary
  renders
- Areas where re-renders could matter

  - Rendering charts
  - Parent components that control many children

- Ways to avoid unnecessary renders

  - Pure Component

    - when prop are not changing fequently
    - when component isn't very complex
    - Example

    ```jsx
    export class ClassComponent extends React.PureComponent {
      // code here
    }

    export const FunctionalComponent = React.memo((props) => {
      // code here
    })
    ```

  - Must watch how props are being passed (follow best practices)

    - example that breaks reference equality

    ```jsx
    export const Panel = ({ width, onPanelClose, ...props }) => {
      ;<CustomChart
        title="something"
        chartStyle={{ color: 'red', width }}
        onClose={() => {
          console.log('closing')
          onPanelClose()
        }}
      />
    }
    ```

    A classical solution?

    ```jsx
    export class Panel extends React.PureComponent {
      constructor(props) {
        super(props)
        this.state = {
          chartStyle: { color: 'red', width: props.width }
        }
      }

      componentDidUpdate(prevProps) {
        const { width } = this.props
        if (width !== prevProps.width)
          this.setState({ chartWidth: { color: 'red', width } })
      }

      closePanel = () => {
        console.log('close this')
        this.props.onPanelClose()
      }

      render() {
        return (
          <CustomChart
            title="something"
            chartStyle={this.state.chartStyle}
            onClose={this.closePanel}
          />
        )
      }
    }
    ```

    ```jsx
    export const Panel = React.memo(({ width, onPanelClose, ...props }) => {
      const chartStyle = useMemo(() => ({ color: 'red', width }), [width])

      const closePanel = useCallback(() => {
        console.log('close this')
        onPanelClose()
      }, [onPanelClose])

      return (
        <CustomChart
          title="something"
          chartStyle={childStyle}
          onClose={closePanel}
        />
      )
    })
    ```

    Redux Example

    ```jsx
    const unfriend = (name) => ({ type: 'UNFRIEND', name })

    const mapStateToProps = (state, ownProps) => {
      const { friendNames } = ownProps
      const friends = friendNames.map((name) => state.user[name])
      const numFriendRequests = state.friendRequests.length
      return {
        friends,
        numFriendRequests
      }
    }

    const mapDispatchToProps = (dispatch) => ({
      unfriend: (name) => dispatch(unfriend(name))
    })

    export const FriendsComponent = connect(
      mapStateToProps,
      mapDispatchToProps
    )(FriendList)
    ```

    ```jsx
    const mapStateToProps = (state, ownProps) => {
      const { friendNames } = ownProps
      const friends = memoize(
        () => friendNames.map((name) => state.user[name]),
        [friendNames, state.user]
      )
      const numFriendRequests = state.friendRequests.length

      return {
        friends,
        numFriendRequests
      }
    }

    const mapDispatchToProps = { unfriend }
    ```

- Prop Filtering

  - restrict props passed to the component so it doesn't update because of a
    prop it doesn't use

  example

  ```jsx
  const PropFilteredFriendList = ({ friends, friendNames, ...props }) => (
    <FriendList friends={friends} />
  )
  ```

## Expensive Calculations

- Slow Renders

  - [Fix the slow render before you fix the re-render](https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render)

- useMemo
  - Calculations performed within render will be performed every render,
    regardless of change. The same goes for functional component.
  - Hook that memorizes the output of a function
  - This is different from useEffect in that useEffect is intended for side
    effects, while functions in useMemo are supposed to be pure w/o side effects

```js
const PassFailChart = (data, filter) => {
  const modifiedData = processData(data, filter)
  return <Chart data={modifiedData} />
}
```

```jsx
const PassFailChart = (data, filter) => {
  const modifiedData = React.useMemo(() => processData(data, filter), [
    data,
    filter
  ])
  return <Chart data={modifiedData} />
}
```

- [Web Workers](https://kentcdodds.com/blog/speed-up-your-app-with-web-workers)

  - Javascript is single-threaded. This means that any javascript environment
    will not run multiple lines of javascript in the same process
    simultaneously.
  - App runs on the main thread, web workers runs on separate thread
  - Issues: serialization costs with communication

- WASM (web assembly)
  - open standard that defines a portable binary-code format for executable
    programs, and a corresponding textual assembly language, as well as
    interfaces for facilitating interactions between such programs and their
    host environment
  - Compilation target for languages such as C,C++, rust

### Virtualization for large lists

React does a great job at batching DOM updates and only updating what needs to
be changed. However, if you need to make HUGE updates to the DOM there isn't
much React can do to help.

List "virtualization" focuses on just rendering items visible to the user. This
works by maintaining a window and moving that window around your list.

<img src="https://user-images.githubusercontent.com/2182637/65490523-a7307980-def0-11e9-9991-a7e0c2a6e30a.gif" width="300">

- Tradeoffs
  - Not searchable with ctrl-F
  - accessibility challenges
  - heavy lists can sometimes show flashing or artifacts if rendering can't keep
    up

## State Management effect on Performance

### Death by a thousand cuts

Death by a thousand cuts means so many components are updated when state changes
that it becomes a performance bottleneck.

Fixing "perf death by a thousand cuts" by colocating state

Example

```jsx
export const Application = () => {
  const [dog, setDog] = React.useState('')
  const [time, setTime] = React.useState(200)
  return (
    <div>
      <DogName time={time} dog={dog} onChange={setDog} />
      <SlowComponent time={time} onChange={setTime} />
    </div>
  )
}
```

[State Colocation will make your React app faster](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)

Moving the state as close to the component using it works in the example above.
However, there may be times where we need to `lift` the state to make it
accessible by multiple components. What can be done to improve performance in
this scenario?

Separating the state:

- swap `useState` with `useReducer`
- create action type and action creator
- wrap action creators in `useCallback`
- Wrap certain components in `React.memo`
- See example here..
  [GitHub - stevekinney/grudges-react-state at exercise-grant-forgiveness](https://github.com/stevekinney/grudges-react-state/tree/exercise-grant-forgiveness)

### Redux Performance tips

- deep cloning state
  [Performance \| Redux](https://redux.js.org/faq/performance#do-i-have-to-deep-clone-my-state-in-a-reducer-isnt-copying-my-state-going-to-be-slow)
- Normalize state (Object vs Array?)
  [Redux Essentials, Part 6: Performance and Normalizing Data \| Redux](https://redux.js.org/tutorials/essentials/part-6-performance-normalization)

### Context performance tips

- Potentially use `React.useMemo` to memoize the context value
- Separate the contexts (`state` in one context provider, and `dispatch`
  function in another context provider)

### Tools for Measuring Performance

- Dev tools Profiler tab
- Dev tools Performance tab

  - To help observe performance problems, click settings gear and change CPU
    throttle.

- User Timings API

  - API that lests you define precise performance marks
  - Marks can be named and are displayed in DEV Tools
  - Often easier to read than trying to drill down into the task flame graph

  ```js
  performance.mark('start')
  // expensive calculation here
  performance.mark('stop')
  performance.measure('mainthread', 'start', 'stop')
  ```

- [why-did-you-render](https://github.com/welldone-software/why-did-you-render)
- Webpack Bundle Analyzer
- One great way to analyze your app to determine the need/benefit of code
  splitting for a certain feature/page/interaction, is to use the “Coverage”
  feature of the developer tools
  [Find Unused JavaScript And CSS Code With The Coverage Tab In Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/coverage)

- [Profiling React component performance with Chrome devtools](https://calibreapp.com/blog/react-performance-profiling-optimization)

## Definitions

- React lifecycle

  - The “render” phase: create React elements React.createElement
  - The “reconciliation” phase: compare previous elements with the new ones
  - The “commit” phase: update the DOM (if needed).

- Component re-render for any of the following reasons

  - props change
  - internal state changes
  - consuming context values which have changed
  - parent re-renders

- Pure Component
  - renders the same output for the same state and props
- Memoization
  - optimization technique that stores the results of expensive function calls
    and returns the cached reuslt when the same inputs occur again
- Shallow comparison
  - a shallow comparison will check that primitives have the same value (eg, 1
    equals 1 or that true equals true) and that the references are the same
    between more complex javascript values like objects and arrays.

## Resources

- [GitHub - kentcdodds/react-performance](https://github.com/kentcdodds/react-performance)
- [React Optimization Tips and Tricks - Time To React - May 2019 - YouTube](https://youtu.be/i9mMe7Esl7Y)
- [Performance Is Magic - How To Make Your React App Performant \|| Ken Wheeler - YouTube](https://youtu.be/6zpzo6y4PDo)
- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Optimizing Performance – React](https://reactjs.org/docs/optimizing-performance.html)
- [Profiling React component performance with Chrome devtools - Calibre](https://calibreapp.com/blog/react-performance-profiling-optimization)
- https://github.com/stevekinney/grudges-react-state
