'use client';

import { useState } from 'react';
import { commentBox } from '@/lib/content';

export function CommentForm() {
  const [posted, setPosted] = useState(false);

  return (
    <form
      className="form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        setPosted(true);
      }}
    >
      <label className="label" htmlFor="comment-body">
        {commentBox.label}
      </label>
      <textarea className="field" id="comment-body" rows={3} placeholder={commentBox.placeholder} />
      <div className="form-actions">
        <button className="btn btn-outline" type="submit">
          Post comment
        </button>
        <p className="form-note" role="status" aria-live="polite">
          {posted ? commentBox.doneNote : commentBox.idleNote}
        </p>
      </div>
    </form>
  );
}
