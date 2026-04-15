interface ErrorMessageProps {
  id?: string;
  message: string;
}
export const ErrorMessage = ({ id, message }: ErrorMessageProps) => (
  <p id={id} role="alert" className="text-danger m-0 text-sm">
    {message}
  </p>
);
