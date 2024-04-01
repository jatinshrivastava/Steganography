// eslint-disable-next-line import/no-extraneous-dependencies
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../sass/style.scss";

import { Dropdown, Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import Modal from "react-modal";

import DownloadFileButton from "../components/downloadFileButton.js";
import "../constants/fontawesome";
import Loader from "../components/loader/Loader";
import { Constants, customStyles } from "../constants";
import { fetchRestCheck } from "../store/rest_check";
import { Services } from "../store/services";
import { Avatar, Utils } from "../utils/utils.js";

Modal.setAppElement(document.getElementById("home"));

const Home = ({ isLoggedIn, user }) => {
  const dispatch = useDispatch();
  const restCheck = useSelector((state) => state.restCheck);
  const [loading, setLoading] = useState(true);
  const [plainTextFile, setplaintextFile] = useState(null);
  const [messageFile, setMessageFile] = useState(null);
  const [plaintextData, setPlaintextData] = useState(null);
  const [messageData, setmessageData] = useState(null);
  const [startingBit, setStartingBit] = useState(0);
  const [length, setLength] = useState(1);
  const [mode, setMode] = useState("fixed");
  const [files, setFiles] = useState([]);
  const [userFiles, setUserFiles] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);

  const [showBugComponent, setShowBugComponent] = useState(false);

  useEffect(() => {
    const action = fetchRestCheck();
    loadFiles();
    dispatch(action);
  }, [dispatch, setLoading]);

  const Link = ({ id, children, title }) => (
    <OverlayTrigger
      overlay={
        <Tooltip className="custom-tooltip" id={id}>
          {title}
        </Tooltip>
      }
    >
      <a href="/#">{children}</a>
    </OverlayTrigger>
  );

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function handlePlaintextFileChange(event) {
    setplaintextFile(event.target.files[0]);
  }

  function handleMessageFileChange(event) {
    setMessageFile(event.target.files[0]);
  }

  const loadFiles = () => {
    setLoading(true);
    dispatch(Services.getFiles())
      .then((response) => {
        if (response.payload.status === 200) {
          const allFiles = response.payload.files;
          const userFiles = [];
          const otherUserFiles = [];
          const currentUserEmail = isLoggedIn && user ? user.email : ""; // Assuming user object is accessible here

          allFiles.forEach((file) => {
            if (file.user_email === currentUserEmail) {
              userFiles.push(file);
            } else {
              otherUserFiles.push(file);
            }
          });

          // Set the filtered files into state
          setUserFiles(userFiles);
          setFiles(otherUserFiles);
        }
        return 0;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteRecord = () => {
    if (selectedFileName !== null) {
      console.log("selectedFileName", selectedFileName);
      dispatch(Services.deleteRecord({ file_name: selectedFileName }))
        .then((response) => {
          if (response.payload.status === 200) {
            setSelectedFileName(null);
            loadFiles();
          }
          return 0;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const deleteFile = (file_name) => {
    dispatch(Services.deleteFile({ file_name }))
      .then((response) => {
        if (response.payload.status === 200) {
          setSelectedFileName(null);
          loadFiles();
        }
        return 0;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const decodeFile = (record_id) => {
    if (record_id !== null) {
      dispatch(Services.decodeFile({ record_id }))
        .then((response) => {
          if (response.payload.status === 200) {
            downloadFile(response.payload);
            deleteFile(response.payload.file_name);
          }
          return 0;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const downloadFile = (response) => {
    const url = Constants.BASE_URL + response.file_path;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        // Create a temporary URL for the blob
        const blobUrl = window.URL.createObjectURL(new Blob([blob]));
        // Create a link element
        const link = document.createElement("a");
        // Set the link's href attribute to the temporary URL
        link.href = blobUrl;
        // Set the link's download attribute to the filename
        link.download = response.file_name;
        // Programmatically click the link to trigger the download
        link.click();
        // Clean up: revoke the temporary URL
        window.URL.revokeObjectURL(blobUrl);
        return 0;
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      });
  };

  const handlePlainTextFileSubmit = (e) => {
    e.preventDefault();
    if (plainTextFile) {
      dispatch(Services.uploadFile(plainTextFile))
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
      dispatch(Services.uploadFile(messageFile))
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

  const handleCancelEncodeSubmit = (e) => {
    e.preventDefault();
    const plaintext_filename = plaintextData.file_name;
    const message_filename = messageData.file_name;
    // Call two APIs simultaneously
    Promise.all([
      dispatch(Services.deleteFile({ file_name: plaintext_filename })),
      dispatch(Services.deleteFile({ file_name: message_filename })),
    ])
      .then(([response1, response2]) => {
        console.log("Response1:", response1);
        console.log("Response2:", response2);
        // Handle response data here
        // Reset form or perform any other action after successful encoding
        window.location.reload();
        return 0;
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
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

    dispatch(Services.encodeData(requestBody))
      .then((response) => {
        console.log("Response:", response);
        // Handle response data here
        // Reset form or perform any other action after successful encoding
        window.location.reload();
        return 0;
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
  };

  if (loading) {
    return <div>{loading && <Loader />}</div>;
  }
  return (
    <div className="container mb-5 mt-6" id="home">
      {modalIsOpen && (
        <Modal
          contentLabel="Example Modal"
          isOpen={modalIsOpen}
          style={customStyles}
          onAfterClose={() => {
            setSelectedFileName(null);
            setIsOpen(false);
          }}
          onHide={() => {
            setSelectedFileName(null);
            setIsOpen(false);
          }}
          onRequestClose={closeModal}
        >
          <h2>Delete Confirmation</h2>
          <br />
          <p>Are you sure you want to delete this file?</p>
          <br />
          <div className="text-right">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            &ensp;&ensp;&ensp;&ensp;
            <Button
              variant="danger"
              onClick={() => {
                deleteRecord();
                closeModal();
              }}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
      <div className="col">
        {isLoggedIn && user ? (
          <div>
            <div className="row d-flex justify-content-center">
              <div className="card shadow-sm mt-5 p-4 w-50">
                {plaintextData && plaintextData.file_name ? (
                  <h4>Plaintext File Uploaded</h4>
                ) : (
                  <form onSubmit={handlePlainTextFileSubmit}>
                    <h3>Upload Plaintext File</h3>
                    <input type="file" onChange={handlePlaintextFileChange} />
                    <button
                      className="btn bg-color-dark-purple text-white"
                      type="submit"
                    >
                      Upload
                    </button>
                  </form>
                )}
                {messageData && messageData.file_name ? (
                  <h4>Message File Uploaded</h4>
                ) : (
                  <form onSubmit={handleMessageFileSubmit}>
                    <h3>Upload Message File</h3>
                    <input type="file" onChange={handleMessageFileChange} />
                    <button
                      className="btn bg-color-dark-purple text-white"
                      type="submit"
                    >
                      Upload
                    </button>
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
                    <div className="row">
                      <div className="col w-50" />
                      <div className="col w-50 d-flex justify-content-between gap-3">
                        <button
                          className="btn col btn-danger"
                          type="button"
                          onClick={handleCancelEncodeSubmit}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn col bg-color-dark-purple text-white"
                          type="button"
                          onClick={handleEncodeSubmit}
                        >
                          Encode
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
            <h2 className="mt-5">Your Uploads</h2>
            {userFiles && userFiles.length !== 0 ? (
              <div className="row mt-2 row-cols-1 row-cols-md-5 g-4">
                {userFiles.map((file, index) => {
                  const fileName = file.encoded_file.file_name;
                  const date = Utils.formatDate(file.created);
                  return (
                    <div key={file.record_id} className="col">
                      <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <span>
                            <p className="card-text">
                              {fileName.length > 16
                                ? `${fileName.slice(0, 16)}...`
                                : fileName}
                            </p>
                          </span>

                          <Dropdown>
                            <Dropdown.Toggle
                              className="clear-dropdown-toggle"
                              id="dropdown-basic"
                              // variant="success"
                            >
                              <FontAwesomeIcon
                                className="dropdown-icon"
                                icon={faEllipsisVertical}
                              />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => {
                                  setSelectedFileName(file.record_id);
                                  decodeFile(file.record_id);
                                }}
                              >
                                Decode
                              </Dropdown.Item>
                              <DownloadFileButton file={file.encoded_file} />
                              <Dropdown.Divider />
                              <Dropdown.Item
                                onClick={() => {
                                  setSelectedFileName(
                                    file.encoded_file.file_name,
                                  );
                                  openModal();
                                }}
                              >
                                Delete
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                        <img
                          alt="..."
                          className="card-img-top"
                          src={file.plaintext_file.file_path}
                        />
                        <div className="card-body">
                          {/* <p className="card-text">{fileName}</p> */}
                          <div className="d-flex justify-content-between align-items-center">
                            <Link href="/#" id="t-1" title={file.user_name}>
                              <Avatar name={file.user_name} />
                            </Link>
                            <span>
                              <p className="card-text">{date}</p>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p> No files found!</p>
            )}
          </div>
        ) : null}

        <div>
          <h2 className="mt-5">All Uploads</h2>
          {files && files.length !== 0 ? (
            <div className="row mt-5 row-cols-1 row-cols-md-4 g-4">
              {files.map((file, index) => {
                const fileName = file.encoded_file.file_name;
                const date = Utils.formatDate(file.created);
                return (
                  <div key={file.record_id} className="col">
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span>
                          <p className="card-text">
                            {fileName.length > 16
                              ? `${fileName.slice(0, 16)}...`
                              : fileName}
                          </p>
                        </span>

                        <Dropdown>
                          <Dropdown.Toggle
                            className="clear-dropdown-toggle"
                            id="dropdown-basic"
                            // variant="success"
                          >
                            <FontAwesomeIcon
                              className="dropdown-icon"
                              icon={faEllipsisVertical}
                            />
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            {/* <Dropdown.Item
                              onClick={() => {
                                setSelectedFileName(file.record_id);
                                decodeFile(file.record_id);
                              }}
                            >
                              Decode
                            </Dropdown.Item> */}
                            <DownloadFileButton file={file.encoded_file} />
                            {/* <Dropdown.Divider />
                            <Dropdown.Item
                              onClick={() => {
                                setSelectedFileName(
                                  file.encoded_file.file_name,
                                );
                                openModal();
                              }}
                            >
                              Delete
                            </Dropdown.Item> */}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                      <img
                        alt="..."
                        className="card-img-top"
                        src={file.plaintext_file.file_path}
                      />
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <Link href="/#" id="t-1" title={file.user_name}>
                            <Avatar name={file.user_name} />
                          </Link>
                          <span>
                            <p className="card-text">{date}</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p> No files found!</p>
          )}
        </div>
      </div>
    </div>
  );
};

Home.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.object,
};

export default Home;
