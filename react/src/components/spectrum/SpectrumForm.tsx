import { PropsWithChildren } from "react";
import { Spectrum } from "../../types";

interface Props {
  remove: () => void;
}

export default function SpectrumForm({
  remove,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="border border-gray-200 p-2 mt-3">
      {children}
      <span className="link" onClick={remove}>
        Delete
      </span>
    </div>
  );
}
