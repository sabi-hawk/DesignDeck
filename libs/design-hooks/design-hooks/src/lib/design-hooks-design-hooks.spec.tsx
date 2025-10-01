import { render } from '@testing-library/react';

import DesignHooksDesignHooks from './design-hooks-design-hooks';

describe('DesignHooksDesignHooks', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DesignHooksDesignHooks />);
    expect(baseElement).toBeTruthy();
  });
});
