import { Sampling } from "../ExposurePanel.tsx";

export function SamplingPanel({ setupData, update }: any) {
  const updateSamplesNumber = (event: any) => {
    updateSamplingSetup("numberOfSamples", event.target.value);
  };
  const updateSamplingSetup = (
    key: "numberOfSamples" | "samplingType",
    value: string,
  ) => {
    update({
      ...setupData,
      sampling: new Sampling({
        ...setupData.sampling,
        [key]: value,
      }),
    });
  };
  return (
    <>
      <div className="columns">
        <div className="column pb-1">
          <div className="control">
            <label className="radio">
              <input
                className="mr-2"
                type="radio"
                name="sampling-type"
                value={"specified"}
                onChange={() =>
                  updateSamplingSetup("samplingType", "Fowler Sampling")
                }
                checked={setupData.sampling.samplingType === "Fowler Sampling"}
              />
              Fowler
            </label>
            <img src={"/images/Fowler.jpg"} alt="Logo" />
          </div>
        </div>
        <div className="column pb-1">
          <div className="control">
            <label className="radio">
              <input
                className="mr-2"
                type="radio"
                name="sampling-type"
                value={"specified"}
                onChange={() =>
                  updateSamplingSetup("samplingType", "Up The Ramp Sampling")
                }
                checked={
                  setupData.sampling.samplingType === "Up The Ramp Sampling"
                }
              />
              Up the Ramp
            </label>

            <img src={"/images/UpTheRamp.jpg"} alt="Logo" />
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="column pt-0">
          <div className="field">
            <label className="label">Number of Samples</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name={"detectorIterations"}
                value={setupData.sampling.numberOfSamples}
                onChange={updateSamplesNumber}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
