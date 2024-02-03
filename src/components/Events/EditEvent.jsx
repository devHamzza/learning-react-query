import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  // const submit = useSubmit();
  // const { state } = useNavigation();

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["events", { eventId: params.id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async ({ event, id }) => {
      await queryClient.cancelQueries({
        queryKey: ["events", { eventId: id }],
      });
      const prevEvent = queryClient.getQueryData(["events", { eventId: id }]);
      queryClient.setQueryData(["events", { eventId: id }], event);

      return { prevEvent };
    },

    onError: (error, { id }, context) => {
      queryClient.setQueryData(["events", { eventId: id }], context.prevEvent);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["events", { eventId: params.id }]);
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData, id: params.id });
    navigate("../");
    // submit(formData, { method: "PUT" });
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <div>
        <ErrorBlock
          title={"Failed To Load"}
          message={error.info?.message || "Please Try loading again!"}
        />
        <div className="form-actions">
          <Link className="button" to={"../"}>
            Okay
          </Link>
        </div>
      </div>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          {/* {state === "submitting" ? "Updating..." : "Update"} */}
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

// export const loader = ({ params }) => {
//   return queryClient.fetchQuery({
//     queryKey: ["events", { eventId: params.id }],
//     queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
//   });
// };

// export const action = async ({ request, params }) => {
//   const formData = await request.formData();
//   const updatedEventData = Object.fromEntries(formData);
//   await updateEvent({ id: params.id, event: updatedEventData });
//   await queryClient.invalidateQueries({ queryKey: ["events"] });
//   return redirect("../");
// };
