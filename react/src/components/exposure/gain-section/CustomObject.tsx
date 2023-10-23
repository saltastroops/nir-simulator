export function CustomObject({ gain, update }: any) {
  const updateGainType = (event: any) => {
    update({
      ...gain,
      [event.target.name]: event.target.value,
    });
  };
  return (
    <div className="notification">
      <div className="columns is-gepless">
        <div className="column">
          <div className="control">
            <input
              className="input"
              name={"firstValue"}
              type="text"
              value={gain.firstValue}
              onChange={() => updateGainType}
            />
          </div>
        </div>
        <div className="column ">e/ADU</div>
      </div>
      <div className="columns">
        <div className="column">Read Noice: </div>
        <div className="column">
          <div className="control">
            <input
              className="input"
              name={"readNoice"}
              type="text"
              value={gain.readNoice}
              onChange={() => updateGainType}
            />
          </div>
        </div>
      </div>
      <div className="columns">
        <div className="column">Full Well: </div>
        <div className="column">
          <div className="control">
            <input
              className="input"
              name={"fullWell"}
              type="text"
              value={gain.fullWell}
              onChange={() => updateGainType}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
