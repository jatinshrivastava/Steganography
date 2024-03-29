import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import { useDispatch, useSelector } from "react-redux";
import "../../sass/style.scss";

import DjangoImgSrc from "../../assets/images/django-logo-negative.png";
import { fetchRestCheck } from "../store/rest_check";
import { uploadFile, encodeData } from "../store/services";

const Home = ({ isLoggedIn, user }) => {
  const dispatch = useDispatch();
  const restCheck = useSelector((state) => state.restCheck);
  const [plainTextFile, setplaintextFile] = useState(null);
  const [messageFile, setMessageFile] = useState(null);
  const [plaintextData, setPlaintextData] = useState(null);
  const [messageData, setmessageData] = useState(null);
  const [startingBit, setStartingBit] = useState(0);
  const [length, setLength] = useState(1);
  const [mode, setMode] = useState("fixed");

  const [showBugComponent, setShowBugComponent] = useState(false);

  useEffect(() => {
    const action = fetchRestCheck();
    console.log("isLoggedIn is ", isLoggedIn);
    console.log("user is ", user);
    dispatch(action);
  }, [dispatch]);

  function handlePlaintextFileChange(event) {
    setplaintextFile(event.target.files[0]);
  }

  function handleMessageFileChange(event) {
    setMessageFile(event.target.files[0]);
  }

  const handlePlainTextFileSubmit = (e) => {
    e.preventDefault();
    if (plainTextFile) {
      dispatch(uploadFile(plainTextFile))
        .then((response) => {
          console.log("Response:", response);
          // Handle response data here
          setplaintextFile(null);
          setPlaintextData(response.payload);
          return 0;
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle error here
        });
    }
  };

  const handleMessageFileSubmit = (e) => {
    e.preventDefault();
    if (messageFile) {
      dispatch(uploadFile(messageFile))
        .then((response) => {
          console.log("Response:", response);
          // Handle response data here
          setMessageFile(null);
          setmessageData(response.payload);
          return 0;
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle error here
        });
    }
  };

  const handleStartingBitChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (
      !isNaN(value) &&
      value >= 0 &&
      plaintextData !== null &&
      value < plaintextData.bitarray_length
    ) {
      setStartingBit(value);
    }
  };

  const handleLengthChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (
      !isNaN(value) &&
      value > 0 &&
      plaintextData !== null &&
      messageData !== null &&
      value <=
        Math.min(plaintextData.bitarray_length, messageData.bitarray_length)
    ) {
      setLength(value);
    }
  };

  const handleEncodeSubmit = (e) => {
    e.preventDefault();
    // Assuming you have the required parameters stored in state variables
    const requestBody = {
      plaintext_file_id: plaintextData.file_id,
      message_file_id: messageData.file_id,
      startingBit,
      length,
      mode,
    };

    dispatch(encodeData(requestBody))
      .then((response) => {
        console.log("Response:", response);
        // Handle response data here
        // Reset form or perform any other action after successful encoding
        return 0;
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
  };

  return (
    <div className="container mb-5 mt-6">
      <div className="row">
        <div className="col d-flex justify-content-center">
          <div className="card shadow-sm mt-5 p-4 w-50">
            {plaintextData && plaintextData.file_name ? (
              <h4>Plaintext File Uploaded</h4>
            ) : (
              <form onSubmit={handlePlainTextFileSubmit}>
                <h3>Upload Plaintext File</h3>
                <input type="file" onChange={handlePlaintextFileChange} />
                <button type="submit">Upload</button>
              </form>
            )}
            {messageData && messageData.file_name ? (
              <h4>Message File Uploaded</h4>
            ) : (
              <form onSubmit={handleMessageFileSubmit}>
                <h3>Upload Message File</h3>
                <input type="file" onChange={handleMessageFileChange} />
                <button type="submit">Upload</button>
              </form>
            )}

            {plaintextData && messageData ? (
              <div>
                <h3>Embedding Parameters</h3>
                <label htmlFor="startingBit">
                  Starting Bit (S):
                  <input
                    disabled={!plaintextData}
                    id="startingBit"
                    max={
                      plaintextData && plaintextData.bitarray_length
                        ? plaintextData.bitarray_length - 1
                        : 0
                    }
                    min={0}
                    type="number"
                    value={startingBit}
                    onChange={handleStartingBitChange}
                  />
                </label>
                <br />
                <label htmlFor="length">
                  Length (L):
                  <input
                    disabled={!(plaintextData && messageData)}
                    id="length"
                    max={
                      plaintextData &&
                      plaintextData.bitarray_length &&
                      messageData &&
                      messageData.bitarray_length
                        ? Math.min(
                            plaintextData.bitarray_length,
                            messageData.bitarray_length,
                          )
                        : 0
                    }
                    min={1}
                    type="number"
                    value={length}
                    onChange={handleLengthChange}
                  />
                </label>
                <p>
                  Valid range for starting bit: 0 to{" "}
                  {plaintextData.bitarray_length - 1}
                  <br />
                  Valid range for length: 1 to{" "}
                  {Math.min(
                    plaintextData.bitarray_length,
                    messageData.bitarray_length,
                  )}
                </p>
                <button
                  className="btn bg-color-dark-purple text-white"
                  type="button"
                  onClick={handleEncodeSubmit}
                >
                  Encode
                </button>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Home.propTypes = {
  isLoggedIn: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
};

export default Home;
