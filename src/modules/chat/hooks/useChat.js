import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotesRequest,
  addNoteRequest,
  clearNotes,
} from "../chatSlice";
import useAuth from "../../auth/hooks/useAuth"; 

const useChat = (appointmentId) => {
  const dispatch = useDispatch();
  const { notes, loading, submitting, error, submitError } = useSelector(
    (state) => state.chat
  );

  const { user } = useAuth();
  const userRole = user?.role?.toUpperCase() || "";

  useEffect(() => {
    if (appointmentId) {
      dispatch(fetchNotesRequest(appointmentId));
    }
    return () => {
      dispatch(clearNotes());
    };
  }, [dispatch, appointmentId]);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    if (userRole === "NURSE") {
      return notes.filter((n) => parseInt(n.is_private) !== 1);
    }
    return notes;
  }, [notes, userRole]);

  const hiddenPrivateCount = useMemo(() => {
    if (userRole === "NURSE" && notes) {
      return notes.filter((n) => parseInt(n.is_private) === 1).length;
    }
    return 0;
  }, [notes, userRole]);

  const handleAddNote = useCallback(
    (noteContent, isPrivate = 0) => {
      if (!appointmentId || !noteContent.trim()) return;
      dispatch(
        addNoteRequest({
          appointment_id: appointmentId,
          note: noteContent,
          is_private: isPrivate ? 1 : 0,
        })
      );
    },
    [dispatch, appointmentId]
  );

  return {
    notes: filteredNotes,
    rawNotesCount: notes?.length || 0,
    hiddenPrivateCount,
    loading,
    submitting,
    error,
    submitError,
    addNote: handleAddNote,
    userRole,
    userId: user?.user_id,
  };
};

export default useChat;
