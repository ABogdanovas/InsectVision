import {Component, ComponentType, Fragment, PropsWithChildren} from 'react';

type ErrorBoundaryProps = PropsWithChildren<{
  FallbackComponent: ComponentType<{error: unknown; reset: () => void}>;
}>;

type ErrorBoundaryState = {
  hasError: boolean;
  error: unknown;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false, error: undefined};
  }

  static getDerivedStateFromError(error: unknown) {
    return {hasError: true, error};
  }

  private reset = () => {
    this.setState({error: undefined, hasError: false});
  };

  render() {
    const {children, FallbackComponent} = this.props;

    if (this.state.hasError) {
      return <FallbackComponent reset={this.reset} error={this.state.error} />;
    }

    return <Fragment>{children}</Fragment>;
  }
}
