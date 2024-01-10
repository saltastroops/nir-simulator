import { PropsWithChildren } from "react";

interface Props {
  label: string;
  remove: () => void;
}

export default function SpectrumForm({
  label,
  remove,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="relative border border-gray-200 p-2 mt-3">
      <div className="italic mb-2">{label}</div>
      <div
        className="absolute top-0 right-0 -translate-x-1 translate-y-1  w-4 h-4 flex justify-center items-center cursor-pointer"
        onClick={remove}
      >
        <div>
          <i className="fa-regular fa-circle-xmark"></i>
        </div>
      </div>
      {children}
    </div>
  );
}
