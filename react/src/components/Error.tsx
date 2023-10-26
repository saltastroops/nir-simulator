interface Props {
  error: string;
}
export function Error({ error }: Props) {
  return <div className="text-red-700">{error}</div>;
}
