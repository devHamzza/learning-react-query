import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";

export default function EventDetails() {
  const navigate = useNavigate();
  const [isDeleting, setisDeleting] = useState(false);
  const params = useParams();
  const {
    data: event,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", { eventId: params.id }],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const {
    mutate,
    isPending: deleting,
    error: delError,
  } = useMutation({
    // mutationKey: ["delete-event"],
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const dateString = event?.date;
  const dateObject = new Date(dateString);
  const formattedDateString = dateObject.toDateString();

  const startDeletion = () => {
    setisDeleting(true);
  };

  const cancelDeletion = () => {
    setisDeleting(false);
  };

  const handleDeleteEvent = () => {
    mutate({ id: params.id });
  };

  return (
    <>
      {isDeleting && (
        <Modal onClose={cancelDeletion}>
          <h2>Are You Sure?</h2>
          <p>Are you really want to delete this event?</p>
          <div className="form-actions">
            <button className="button-text" onClick={cancelDeletion}>
              Cancel
            </button>
            <button className="button" onClick={handleDeleteEvent}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
          {delError && (
            <ErrorBlock
              title={"Failed to delete"}
              message={delError.info?.message || "Please Try again!"}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && (
        <div className="center" id="event-details-content">
          <LoadingIndicator />
        </div>
      )}
      {isError && (
        <div className="center" id="event-details-content">
          <ErrorBlock
            title={"Request Failed"}
            message={error.info?.message || "Could not fetch event's deatils"}
          />
        </div>
      )}
      {event && !isError && (
        <article id="event-details">
          <header>
            <h1>{event.title}</h1>
            <nav>
              <button onClick={startDeletion}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={"http://localhost:3000/" + event.image} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{event.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {formattedDateString}
                </time>
              </div>
              <p id="event-details-description">{event.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
