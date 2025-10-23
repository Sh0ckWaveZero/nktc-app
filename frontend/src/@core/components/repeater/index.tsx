// ** Types
import { RepeaterProps } from './types';

const Repeater = (props: RepeaterProps) => {
  // ** Props
  const { count, tag, children, ...restProps } = props;

  // ** Custom Tag
  const Tag = (tag || 'div') as any;

  // ** Default Items
  const items = [];

  // ** Loop passed count times and push it in items Array
  for (let i = 0; i < count; i++) {
    items.push(children(i));
  }

  return <Tag {...restProps}>{items}</Tag>;
};

export default Repeater;
