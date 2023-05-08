<h1 align="center">Range component</h1>

The goal of this project to solve a test creating a `<Range />` component.

This project was created using a [Vite](https://vitejs.dev/) Vanilla JS project and configurating it with the required dependencies to work using [React](https://react.dev/).

## Goal

The goal of this project is to create the following component: `<Range />`.

You have to use React to create the solution.
You do NOT have to use any CLI to create structure and architecture of your application.
This component has two use modes:

1. Normal range from min to max number
2. Fixed number of options range

### Use cases

_Normal Range:_

Provide a localhost:8080/exercise1 route with the following:

- The component CAN'T be a HTML5 input range. It has to be a custom one.
- The user can drag two bullets through the range line.
- The user can click on both currency number label values (min or max) and set a
  new value.
- The value will never be less than min or greater than max input values.
- When some bullet is on hover, this bullet has to be bigger and change cursor's type
  into draggable.
- Dragging a bullet turns cursor to dragging
- Min value and max value can't be crossed in range
- For this example, provide a mocked http service returning min and max values
  that have to be used in the component. Example: {min: 1, max: 100}. Use
  https://www.mockable.io/ or a custom mocked
  server.
- Do as many unit tests as you can.

_Fixed values range:_

Provide a localhost:8080/exercise2 route with the following:

- The component CAN'T be a HTML5 input range. It has to be a custom one.
- Given a range of values: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99] the user will only
  be able to select those values in range
- Provide a mocked http service that returns the array of numbers: [1.99, 5.99,
  10.99, 30.99, 50.99, 70.99]. Use https://www.mockable.io/ or a custom mocked
  server.
- For this type of range, currency values are not input changable. They have to be
  only a label
- The user can drag two bullets through the range line.
- Min value and max value can't be crossed in range
- For this example, provide a mocked service returning min and max values that
  have to be used in the component. Example: {rangeValues: []}
- Do as many unit tests as you can.

## Component configuration

The component accepts an object prop called `config` witch which we can configure some parameters:

- `min` and `max`: minimum and maximum values. The possible values between them will be automatically generated using the `step` parameter. Have to be set in order to use the component as a **normal range**.
- `step`: distance between possible values.
- `values`: array of possible values. No more possible values are added between them. Have to be set in order to use the component as a **fixed values range**.
- `currencyMode`: Shows the values as currency (e.g. 1,00€) and sets the `step` to 0,01.
- `showMinSelectedValue`: Shows the min selected value below the min-bullet.
- `showMaxSelectedValue`: Shows the max selected value below the max-bullet.
- `showStepTicks`: Shows little marks to indicate the possible values. Not recommended with normal ranges with little step or with `currencyMode` active.
- `showStepLabels`: Shows little labels above the possible values. Not recommended with normal ranges with little step or with `currencyMode` active.

NOTE: either `min` and `max` or `values` have to be set, otherwise the component will throw an error.

## Other information

As well as dragging the bullets the min and max values can be set using the arrow keys.

In order to be able to use the arrow keys a bullet has to be dragged first and them we can use the left and bottom arrows to go to the previous possible value and the right and up arrows to go to the next possible value.

Note: if the mouse leaves the component the arrow keys are disabled to avoid problems with other components which use them (for example if you have to use more than one range component simultaneously).

## Examples

- Normal range currency:

<img src="./src/assets/Normal range currency.png" height="84px" alt="Normal range currency">

- Normal range:

<img src="./src/assets/Normal range no currency.png" height="100px" alt="Normal range no currency">

- Fixed values range with step ticks and labels:

<img src="./src/assets/Fixed values range with step ticks and labels.png" height="100px" alt="Fixed values range with step ticks and labels">

## Available Scripts

In the project directory, you can run:

#### `npm run dev`

Runs the app in the development mode.
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

#### `npm run lint`

Runs `eslint` to find errors and problems in code style.

#### `npm run test`

Launches the test runner in the interactive watch mode.

In this project [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/) are used to create and run the tests.

#### `npm run coverage`

Launches the test runner and generates the tests code coverage report.
