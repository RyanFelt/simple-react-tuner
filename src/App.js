import React, { useState, useEffect } from "react";
import "./App.css";
import ml5 from "ml5";
import getUserMedia from "get-user-media-promise";
import { Modal, Button } from "react-bootstrap";
import { data } from "./data";

function App() {
  const [pitch, setPitch] = useState(0);

  useEffect(() => {
    let index = 0;
    for (let x = 0; x < data.length; x++) {
      if (pitch > data[x].freq) {
      } else if (pitch <= data[x].freq) {
        index = x - 1;
        break;
      }
    }

    let grid = [];
    for (let x = index - 10; x < index + 11; x++) {
      let newItem = { note: "*" };
      if (data[x]) {
        newItem = data[x];
      }
      grid.push(newItem);
    }
    setTuneGrid(grid);
  }, [pitch]);

  const [tuneGrid, setTuneGrid] = useState([]);
  const [startPopUp, setStartPopUp] = useState(true);

  const doNothing = () => {};

  const handleClose = () => {
    setStartPopUp(false);
    startTuner();
  };

  const startTuner = () => {
    const audioContext = new AudioContext();
    audioContext.resume().then(() => {
      getUserMedia({ video: false, audio: true })
        .then(micStream => {
          let noPitchCount = 0;

          const modelLoaded = (err, model) => {
            if (err) {
              console.log("ERROR :: ", err);
            } else {
              model.getPitch((err, frequency) => {
                getPitch(model);
              });
            }
          };

          const getPitch = model => {
            model.getPitch((err, frequency) => {
              if (err) {
                console.log("ERROR :: ", err);
              } else {
                if (frequency) {
                  setPitch(frequency.toFixed(3));
                } else {
                  if (noPitchCount === 50) {
                    setPitch(0);
                    noPitchCount = 0;
                  }
                  noPitchCount += 1;
                }
                getPitch(model);
              }
            });
          };

          ml5.pitchDetection(
            "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/",
            audioContext,
            micStream,
            modelLoaded
          );
        })
        .catch(err => console.log(err));
    });
  };

  return (
    <div className="App">
      <Modal show={startPopUp} onHide={doNothing} centered="true">
        <br />
        <Modal.Body>
          <div className="App">Mic listening, tuner ready to start!</div>
        </Modal.Body>
        <div className="flex-row">
          <Button variant="dark" onClick={handleClose}>
            <strong> Start Tuning </strong>
          </Button>
          <br />
        </div>
        <br />
      </Modal>

      <br />
      <h1>{pitch} Hz</h1>
      <br />
      <div>
        <h1>V</h1>
      </div>

      <div className="flex-row">
        {tuneGrid.map((item, index) => (
          <div className="flex-grid" key={index}>
            {item.note}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
