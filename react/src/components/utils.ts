export function label(extraClasses?: string) {
  let className = "";
  if (extraClasses) {
    className += ` ${extraClasses}`;
  }
  return className;
}

export function input(extraClasses?: string) {
  let className =
    "rounded-md border border-gray-300 hover:border-gray-400 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-1.5 py-1";
  if (extraClasses) {
    className += ` ${extraClasses}`;
  }
  return className;
}

export function select(extraClasses?: string) {
  let className =
    "rounded-md border border-gray-300 shadow-sm hover:border-gray-400 focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 px-1.5 py-1";
  if (extraClasses) {
    className += ` ${extraClasses}`;
  }
  return className;
}

export function button(extraClasses?: string) {
  let className =
    "rounded-md border border-gray-300 hover:border-gray-400 shadow-sm px-1.5 py-1";
  if (extraClasses) {
    className += ` ${extraClasses}`;
  }
  return className;
}
