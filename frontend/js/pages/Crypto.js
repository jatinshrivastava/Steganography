// eslint-disable-next-line import/no-extraneous-dependencies
import {
  faEllipsisVertical,
  faPlus,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import "../../sass/style.scss";

import { Dropdown, Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import Modal from "react-modal";
import { Bounce, toast } from "react-toastify";

import DownloadFileButton from "../components/downloadFileButton.js";
import "../constants/fontawesome";
import Loader from "../components/loader/Loader";
import { Constants, customStyles } from "../constants";
import { fetchRestCheck } from "../store/rest_check";
import { Services } from "../store/services";
import { Avatar, Utils } from "../utils/utils.js";

import { faFile, faFileCode } from "@fortawesome/free-regular-svg-icons";
// import "../../assets/ReactToastify.css";
import "react-toastify/dist/ReactToastify.css";

Modal.setAppElement(document.getElementById("crypto"));

const Crypto = ({ isLoggedIn, user }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [userFiles, setUserFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [hashes, setHashes] = useState([]);
  const [keys, setKeys] = useState([]);
  const [deleteModalIsOpen, setDeleteModelIsOpen] = useState(false);
  const [nameModalIsOpen, setNameModalIsOpen] = useState(false);
  const [keyModalIsOpen, setKeyModalIsOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedKeyId, setSelectedKeyId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0); // initial active index is 0
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isEncrypting, setIsEncrypting] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [fileUrlDict, setFileUrlDict] = useState({});

  useEffect(() => {
    const action = fetchRestCheck();
    refreshData();
    if (isLoggedIn && user) {
      getKeys(user.id);
    }
    dispatch(action);
  }, [dispatch, setLoading]);

  const refreshData = () => {
    loadFiles();
    loadUserHashes();
  };

  const showToast = (message) => {
    toast(message, {
      position: "bottom-right",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

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
    setDeleteModelIsOpen(true);
  }

  function closeModal() {
    setDeleteModelIsOpen(false);
  }

  const loadFiles = () => {
    setLoading(true);
    dispatch(Services.getFiles())
      .then((response) => {
        if (response.payload.status === 200) {
          const allFiles = response.payload.files;
          const userFiles = [];

          allFiles.forEach((file) => {
            userFiles.push(file);
          });

          // Set the filtered files into state
          setUserFiles(userFiles);
          fetchFilesConcurrently(allFiles);
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

  const fetchFilesConcurrently = (files) => {
    const promises = files.map((file) =>
      dispatch(Services.getUploadedFile(file)),
    );
    Promise.all(promises)
      .then((action) => {
        const dict = {};
        action.forEach((action, index) => {
          const file = files[index];
          if (action.type.endsWith("fulfilled")) {
            dict[file.id] = action.payload;
          }
        });

        setFileUrlDict(dict);
        return 0;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // const getFileUrl = async (file) => {
  //   dispatch(Services.getUploadedFile(file))
  //     .then((action) => {
  //       if (action.type.endsWith("fulfilled")) {
  //         console.log("action is ", action);
  //         return action.payload;
  //       }
  //       return 0;
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // };

  const loadUserHashes = () => {
    setLoading(true);
    dispatch(Services.getUserHashes())
      .then((response) => {
        if (response.payload.status === 200) {
          const allHashes = response.payload.hashes;
          const userHashes = [];

          allHashes.forEach((hash) => {
            userHashes.push(hash);
          });

          // Set the filtered files into state
          setHashes(userHashes);
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

  const hashFile = (file_id) => {
    dispatch(Services.hashFile({ file_id }))
      .then((response) => {
        if (response.payload.status === 200) {
          setSelectedFileId(null);
          showToast(`Hash File: Took ${response.payload.time_taken} μs!`);
        }
        return 0;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  const encryptFile = (file_id, key_id) => {
    dispatch(Services.encryptFile({ file_id, key_id }))
      .then((response) => {
        if (response.payload.status === 200) {
          showToast(`Encrypt File: Took ${response.payload.time_taken} μs!`);
          setSelectedFileId(null);
          setSelectedKeyId(null);
          loadFiles();
        }
        return 0;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  const decryptFile = (file_id, key_id) => {
    dispatch(Services.decryptFile({ file_id, key_id }))
      .then((response) => {
        if (response.payload.status === 200) {
          showToast(`Decrypt File: Took ${response.payload.time_taken} μs!`);
          setSelectedFileId(null);
          setSelectedKeyId(null);
          loadFiles();
        }
        return 0;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  const generateKey = (name) => {
    dispatch(Services.generateKey({ name }))
      .then((response) => {
        if (response.payload.status === 200) {
          setKeyName("");
          console.log("showing toast!");
          showToast(`Generate Key: Took ${response.payload.time_taken} μs!`);
          if (isLoggedIn && user) {
            getKeys(user.id);
          }
        }
        return 0;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const deleteKey = () => {
    if (selectedKeyId !== null) {
      dispatch(Services.deleteKey({ key_id: selectedKeyId }))
        .then((response) => {
          if (response.payload.status === 200) {
            setSelectedKeyId(null);
            getKeys(user.id);
          }
          return 0;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const getKeys = (user_id) => {
    setLoading(true);
    dispatch(Services.getUserKeys({ user_id }))
      .then((response) => {
        if (response.payload.status === 200) {
          setKeys(response.payload.keys);
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

  const deleteFile = () => {
    if (selectedFileId !== null) {
      dispatch(Services.deleteFile({ file_id: selectedFileId }))
        .then((response) => {
          if (response.payload.status === 200) {
            setSelectedFileId(null);
            loadFiles();
          }
          return 0;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  // Prevent default behavior of dragging over an element
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    // Get the dropped file (assuming only one file is dropped)
    const droppedFile = e.dataTransfer.files[0];

    // Check if a file is dropped
    if (droppedFile) {
      // Call the upload function for the dropped file
      uploadFile(droppedFile); // Replace 'uploadFile' with your actual upload function
    }
  };

  // Handle file input change for traditional upload
  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  const uploadFile = (selectedFile) => {
    if (selectedFile) {
      dispatch(Services.uploadFile(selectedFile))
        .then((response) => {
          console.log("Response:", response);
          // Handle response data here
          window.location.reload();
          return 0;
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle error here
        });
    }
  };

  if (loading) {
    return <div>{loading && <Loader />}</div>;
  }
  return (
    <div className="" id="crypto">
      {deleteModalIsOpen && (
        <Modal
          contentLabel="Example Modal"
          isOpen={deleteModalIsOpen}
          style={customStyles}
          onAfterClose={() => {
            setSelectedFileId(null);
            setDeleteModelIsOpen(false);
          }}
          onHide={() => {
            setSelectedFileId(null);
            setDeleteModelIsOpen(false);
          }}
          onRequestClose={closeModal}
        >
          <h2>Delete Confirmation</h2>
          <br />
          <p>
            Are you sure you want to delete this{" "}
            {selectedData === Constants.FileId
              ? "file"
              : selectedData === Constants.KeyId
                ? "key"
                : ""}{" "}
            ?
          </p>
          <br />
          <div className="text-right">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            &ensp;&ensp;&ensp;&ensp;
            <Button
              variant="danger"
              onClick={() => {
                if (selectedData === Constants.FileId) {
                  deleteFile();
                } else if (selectedData === Constants.KeyId) {
                  deleteKey();
                }
                closeModal();
              }}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}

      {nameModalIsOpen && (
        <Modal
          contentLabel="Name Modal"
          isOpen={nameModalIsOpen}
          style={customStyles}
          onAfterClose={() => {
            setNameModalIsOpen(false);
            setKeyName("");
          }}
          onRequestClose={() => setNameModalIsOpen(false)}
        >
          <h4 className="pb-3">Enter Key Name</h4>
          <input
            className="custom-input"
            placeholder="Key name"
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
          />
          <br />
          <div className="d-flex justify-content-end pt-3">
            <Button
              variant="secondary"
              onClick={() => setNameModalIsOpen(false)}
            >
              Cancel
            </Button>
            &ensp;&ensp;&ensp;&ensp;
            <Button
              variant="primary"
              onClick={() => {
                setNameModalIsOpen(false);
                generateKey(keyName);
              }}
            >
              Submit
            </Button>
          </div>
        </Modal>
      )}

      {keyModalIsOpen && (
        <Modal
          contentLabel="Select Keys Modal"
          isOpen={keyModalIsOpen}
          style={customStyles}
          onAfterClose={() => {
            setKeyModalIsOpen(false);
            setSelectedKeyId(null);
          }}
          onRequestClose={() => setKeyModalIsOpen(false)}
        >
          <h4 className="pb-3">Select Key</h4>
          <select
            className="custom-select"
            value={selectedKeyId}
            onChange={(e) => setSelectedKeyId(e.target.value)}
          >
            <option value="">Select a key</option>
            {keys.map((key) => (
              <option key={key.id} value={key.id}>
                {key.name}
              </option>
            ))}
          </select>
          <br />
          <div className="d-flex justify-content-end pt-3">
            <Button
              variant="secondary"
              onClick={() => setKeyModalIsOpen(false)}
            >
              Cancel
            </Button>
            &ensp;&ensp;&ensp;&ensp;
            <Button
              disabled={selectedKeyId === null} // Disable button if no key is selected
              variant="primary"
              onClick={() => {
                if (isEncrypting) {
                  encryptFile(selectedFileId, selectedKeyId);
                } else {
                  decryptFile(selectedFileId, selectedKeyId);
                }
                setKeyModalIsOpen(false);
              }}
            >
              {isEncrypting ? "Encrypt" : "Decrypt"}
            </Button>
          </div>
        </Modal>
      )}

      <div className="row mt-6 wrapper-content">
        <div className="bg-color-dark-purple sidebar">
          <ul className="list-group ps-0">
            <li key={0} className="list-group-item">
              <Button
                className={`w-100 sidebar-button ${
                  activeIndex === 0 ? "active" : ""
                }`}
                onClick={() => setActiveIndex(0)}
              >
                <FontAwesomeIcon className="ps-2 pe-3" icon={faFile} />
                <span className="sidebar-text">Files</span>
              </Button>
            </li>
            <li key={1} className="list-group-item">
              <Button
                className={`w-100 sidebar-button ${
                  activeIndex === 1 ? "active" : ""
                }`}
                onClick={() => setActiveIndex(1)}
              >
                <FontAwesomeIcon className="ps-2 pe-3" icon={faKey} />
                <span className="sidebar-text">Keys</span>
              </Button>
            </li>
            <li key={2} className="list-group-item">
              <Button
                className={`w-100 sidebar-button text-right ${
                  activeIndex === 2 ? "active" : ""
                }`}
                onClick={() => setActiveIndex(2)}
              >
                <FontAwesomeIcon className="ps-2 pe-3" icon={faFileCode} />
                <span className="sidebar-text">File Hashes</span>
              </Button>
            </li>
          </ul>
        </div>
        <div className="main-content">
          {activeIndex === 0 ? (
            <div className="mb-5 mt-6">
              {isLoggedIn && user ? (
                <div>
                  <div className="row d-flex justify-content-center">
                    <div
                      className={`card shadow-sm mt-5 p-4 w-50 ${
                        dragging
                          ? "d-flex justify-content-center align-items-center"
                          : ""
                      }`}
                      style={{ minHeight: "200px" }}
                      onDragEnter={() => setDragging(true)}
                      onDragLeave={() => setDragging(false)}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {dragging ? (
                        <h5 className="text-center mt-2">Drop Here!</h5>
                      ) : (
                        <>
                          <h5 className="text-center mt-2">
                            Drag your files here to upload
                          </h5>
                          <div className="row mt-3">
                            <div className="col-5">
                              <hr className="my-2" />
                            </div>
                            <div className="col-2 text-center">
                              <p className="text-muted">OR</p>
                            </div>
                            <div className="col-5">
                              <hr className="my-2" />
                            </div>
                          </div>
                          <div className="text-center mt-2">
                            <label
                              className="btn btn-primary"
                              htmlFor="fileInput"
                            >
                              Browse File
                              <input
                                id="fileInput"
                                style={{ display: "none" }}
                                type="file"
                                onChange={handleFileInputChange}
                              />
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <h2 className="mt-5">Your Uploads</h2>
                  {userFiles && userFiles.length !== 0 ? (
                    <div className="row mt-2 row-cols-1 row-cols-md-5 g-4">
                      {userFiles.map((file, index) => {
                        const fileName = file.file_name;
                        const date = Utils.formatDate(file.created);
                        const isEncrypted = fileName.endsWith(".enc");
                        const url = fileUrlDict[file.id];
                        return (
                          <div key={file.id} className="col">
                            <div className="card h-100">
                              <div className="card-header d-flex justify-content-between align-items-center">
                                <span>
                                  <p className="card-text">
                                    {fileName.length > 14
                                      ? `${fileName.slice(0, 14)}...`
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
                                        hashFile(file.id);
                                      }}
                                    >
                                      Hash File
                                    </Dropdown.Item>
                                    {/* Conditional rendering for Encrypt or Decrypt option */}
                                    {isEncrypted ? (
                                      <Dropdown.Item
                                        onClick={() => {
                                          setIsEncrypting(false);
                                          setSelectedFileId(file.id);
                                          setKeyModalIsOpen(true);
                                        }}
                                      >
                                        Decrypt File
                                      </Dropdown.Item>
                                    ) : (
                                      <Dropdown.Item
                                        onClick={() => {
                                          setIsEncrypting(true);
                                          setSelectedFileId(file.id);
                                          setKeyModalIsOpen(true);
                                        }}
                                      >
                                        Encrypt File
                                      </Dropdown.Item>
                                    )}
                                    <DownloadFileButton file={file} />
                                    <Dropdown.Divider />
                                    <Dropdown.Item
                                      onClick={() => {
                                        setSelectedFileId(file.id);
                                        setSelectedData(Constants.FileId);
                                        openModal();
                                      }}
                                    >
                                      Delete
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </div>
                              {/* {isEncrypted ? (
                              <div className="encrypted-file-div d-flex justify-content-center align-items-center">
                                <FontAwesomeIcon
                                  className="encrypted-file-icon"
                                  icon={faFileShield}
                                />
                              </div>
                            ) : (
                              <img
                                alt="..."
                                className="card-img-top"
                                src={file.file_path}
                              />
                            )} */}
                              <div className="custom-file-div d-flex justify-content-center align-items-center">
                                {/* Use the renderFileIcon function to display the file icon */}
                                {Utils.renderFileIcon(file.file_path, url)}
                              </div>
                              <div className="card-body">
                                {/* <p className="card-text">{fileName}</p> */}
                                <div className="d-flex justify-content-between align-items-center">
                                  <Link
                                    href="/#"
                                    id="t-1"
                                    title={file.user_name}
                                  >
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
            </div>
          ) : activeIndex === 1 ? (
            <div className="mb-5">
              <h2 className="mt-5">Your Keys</h2>
              <div className="d-flex pt-4 justify-content-between align-items-center">
                <span className="text-muted">
                  <b>Keys Generated:</b> {keys.length} of 20
                </span>
                <Button
                  className="clear-button bg-color-xanthous"
                  disabled={keys.length >= 20}
                  onClick={() => setNameModalIsOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} /> Add Key
                </Button>
              </div>

              <div className="report_Container mt-3">
                <div className="report-body">
                  <table className="list">
                    <thead className="table-head">
                      <tr>
                        <th>Sr. no</th>
                        <th>Name</th>
                        <th>Key</th>
                        <th>Created On</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((key, index) => {
                        const date = Utils.formatDate(key.created);
                        return (
                          <tr key={key.id} className="">
                            <td className="">{index + 1}</td>
                            <td className="">{key.name}</td>
                            <td className="">{key.key}</td>
                            <td className="">{date}</td>

                            <td>
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
                                  <Dropdown.Item onClick={() => {}}>
                                    Rename
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      setSelectedKeyId(key.id);
                                      setSelectedData(Constants.KeyId);
                                      openModal();
                                    }}
                                  >
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeIndex === 2 ? (
            <div className="mb-5">
              <h2 className="mt-5">Your Hashes</h2>
              <div className="d-flex pt-4 justify-content-between align-items-center">
                <span className="text-muted">
                  <b>Hashes Generated:</b> {hashes.length} of 20
                </span>
                {/* <Button
                className="clear-button bg-color-xanthous"
                disabled={keys.length >= 20}
                onClick={() => setNameModalIsOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Key
              </Button> */}
              </div>

              <div className="report_Container mt-3">
                <div className="report-body">
                  <table className="list">
                    <thead className="table-head">
                      <tr>
                        <th>Sr. no</th>
                        <th>File Name</th>
                        <th>Hash Name</th>
                        <th>Hash Value</th>
                        <th>Created On</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {hashes.map((hash, index) => {
                        const date = Utils.formatDate(hash.created);
                        return (
                          <tr key={hash.id} className="">
                            <td className="">{index + 1}</td>
                            <td className="">{hash.file_name}</td>
                            <td className="">{hash.hash_name}</td>
                            <td className="">
                              {hash.hash.length > 16
                                ? `${hash.hash.slice(0, 16)}...`
                                : hash.hash}
                            </td>
                            <td className="">{date}</td>

                            <td>
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

                                <Dropdown.Menu className="dropdown-menu">
                                  <Dropdown.Item
                                    onClick={() => {
                                      Utils.downloadHash(
                                        hash.hash,
                                        hash.hash_name,
                                      );
                                    }}
                                  >
                                    Download
                                  </Dropdown.Item>
                                  {/* <Dropdown.Item onClick={() => {}}>
                                  Rename
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    // openModal();
                                  }}
                                >
                                  Delete
                                </Dropdown.Item> */}
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

Crypto.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.object,
};

export default Crypto;
