/**
 * @format
 */
import { render } from '@testing-library/react-native';
import App from '../App';

test('Snapshot', () => {
  const { toJSON } = render(<App />);
  expect(toJSON()).toMatchSnapshot();
});
