import React from 'react';
import { shallow } from 'enzyme';
import TestComponent from './index';

describe('test', () => {
  it('test1', () => {
    const wrapper = shallow(<TestComponent />);
    expect(wrapper).toMatchSnapshot();
  });

  it('test2', () => {
    const wrapper = shallow(<TestComponent />);
    expect(wrapper.find('h1')).toHaveLength(1);
  });
});
