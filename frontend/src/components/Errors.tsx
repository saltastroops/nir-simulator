interface Props {
  errors: Record<string, string>;
  keys: string[];
}

export default function Errors({ errors, keys }: Props) {
  return (
    <div className="mt-1">
      {keys.map(
        (key) =>
          errors[key] && (
            <div key={key} className="text-red-700">
              {errors[key]}
            </div>
          ),
      )}
    </div>
  );
}
