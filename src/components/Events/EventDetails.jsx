import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const navigate = useNavigate();
  const params = useParams();
  const { data, isPending, isError } = useQuery({
    queryKey: ["events-deatils"],
    queryFn: ({ signal }) => fetchEvent({ id: params.id, signal }),
  });

  const { mutate } = useMutation({
    // mutationKey: ["delete-event"],
    mutationFn: () => deleteEvent({ id: params.id }),
    onSuccess: () => {
      navigate("/events");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const dateString = data?.date;
  const dateObject = new Date(dateString);
  const formattedDateString = dateObject.toDateString();

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && (
        <p style={{ textAlign: "center" }}>Please Wait! Loading...</p>
      )}
      {isError && (
        <ErrorBlock
          title={"Request Failed"}
          message={"Could not fetch event's deatils"}
        />
      )}
      {data && !isError && (
        <article id="event-details">
          <header>
            <h1>EVENT TITLE</h1>
            <nav>
              <button onClick={mutate}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={"http://localhost:3000/" + data.image} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {formattedDateString}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
