'use client';

import { useActionState, useState } from 'react';
import {
  signIn, signOut, setUpFirstAdmin, acceptInvitation, invitePerson, changePerson, changeOwnPassword,
  type AuthResult,
} from './auth-actions';

const box = 'w-full bg-card-2 border border-line rounded-lg px-3 py-2 text-[13px]';
const primary = 'bg-ink text-white font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50';
const plain = 'border border-line font-bold text-[12px] px-3 py-[7px] rounded-lg disabled:opacity-50';

function Status({ state }: { state: AuthResult | null }) {
  if (!state) return null;
  return (
    <p className={`text-[12px] leading-[1.7] ${state.ok ? 'text-up' : 'text-down'}`} role="status">
      {state.message}
      {state.link && (
        <code className="block mt-2 p-2 bg-card-2 border border-line rounded-lg break-all text-[11.5px] text-ink select-all">
          {state.link}
        </code>
      )}
    </p>
  );
}

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(signIn, null);
  return (
    <form action={action} className="flex flex-col gap-[11px]">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Email</span>
        <input name="email" type="email" autoComplete="username" required className={box} />
      </label>
      <label className="block">
        <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className={box} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={primary}>{pending ? 'Signing in…' : 'Sign in'}</button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function SetUpForm() {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(setUpFirstAdmin, null);
  return (
    <form action={action} className="flex flex-col gap-[11px]">
      <label className="block">
        <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Your name</span>
        <input name="name" required className={box} />
      </label>
      <label className="block">
        <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Email</span>
        <input name="email" type="email" autoComplete="username" required className={box} />
      </label>
      <label className="block">
        <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Password</span>
        <input name="password" type="password" autoComplete="new-password" required className={box} />
        <span className="block text-[11px] text-ink-3 mt-1">
          Twelve characters or more. Length is what makes a password hard; a digit and a symbol
          just produce the same password everybody else picked.
        </span>
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={primary}>
          {pending ? 'Creating…' : 'Create the first account'}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function AcceptForm({ token, name }: { token: string; name: string }) {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(acceptInvitation, null);
  return (
    <form action={action} className="flex flex-col gap-[11px]">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="username" value={name} autoComplete="username" />
      <label className="block">
        <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Choose a password</span>
        <input name="password" type="password" autoComplete="new-password" required className={box} />
        <span className="block text-[11px] text-ink-3 mt-1">Twelve characters or more.</span>
      </label>
      <label className="block">
        <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">And again</span>
        <input name="again" type="password" autoComplete="new-password" required className={box} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={primary}>
          {pending ? 'Setting up…' : 'Set up my account'}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function InviteForm() {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(invitePerson, null);
  return (
    <form action={action} className="flex flex-col gap-[11px]">
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Name</span>
          <input name="name" required className={box} />
        </label>
        <label className="flex-1">
          <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Email</span>
          <input name="email" type="email" required className={box} />
        </label>
      </div>
      <label className="block">
        <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Role</span>
        <select name="role" defaultValue="editor" className={box}>
          <option value="editor">Editor — records, articles and verifications</option>
          <option value="moderator">Moderator — reviews and verifications</option>
          <option value="viewer">Viewer — can look, cannot change anything</option>
          <option value="admin">Admin — everything, including who else gets in</option>
        </select>
      </label>
      <div className="flex items-center gap-3 flex-wrap">
        <button type="submit" disabled={pending} className={primary}>
          {pending ? 'Making a link…' : 'Make an invitation link'}
        </button>
      </div>
      <Status state={state} />
    </form>
  );
}

/**
 * Which button was pressed travels in a hidden input rather than on the button.
 *
 * A submit button's own name and value did not reach the action here — the form
 * arrived carrying its inputs and nothing to say what had been asked for, so
 * every press came back "Unknown action". It is the same thing `ModerateReview`
 * works around, and it is worth doing the same way rather than relying on a
 * detail of how a framework builds form data from a submitter: the button sets
 * the field, the field is an input like any other, and what arrives is what the
 * form says it contains.
 */
export function PersonControls({ id, role, disabled, isSelf }: {
  id: number; role: string; disabled: boolean; isSelf: boolean;
}) {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(changePerson, null);
  const [what, setWhat] = useState('role');
  return (
    <form action={action} className="mt-2 flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value={what} />
      <div className="flex items-center gap-2 flex-wrap">
        <select name="role" defaultValue={role} disabled={isSelf} className="bg-card-2 border border-line rounded-lg px-2 py-[6px] text-[12px]">
          <option value="admin">admin</option>
          <option value="editor">editor</option>
          <option value="moderator">moderator</option>
          <option value="viewer">viewer</option>
        </select>
        <button type="submit" onClick={() => setWhat('role')} disabled={pending || isSelf} className={plain}>Set role</button>
        <button
          type="submit"
          onClick={() => setWhat(disabled ? 'enable' : 'disable')}
          disabled={pending || isSelf}
          className={plain + (disabled ? '' : ' text-down')}
        >
          {disabled ? 'Turn back on' : 'Turn off'}
        </button>
        <button type="submit" onClick={() => setWhat('sign-out-everywhere')} disabled={pending} className={plain}>
          Sign out everywhere
        </button>
      </div>
      {isSelf && (
        <p className="text-[11px] text-ink-3">
          Your own account, so the role and the switch are somebody else’s to change. Locking the
          last admin out of the site is too easy to allow.
        </p>
      )}
      <Status state={state} />
    </form>
  );
}

export function RevokeInvite({ id }: { id: number }) {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(changePerson, null);
  return (
    <form action={action} className="inline-flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="action" value="revoke-invite" />
      <button type="submit" disabled={pending} className={plain}>
        Revoke
      </button>
      {state && <span className={`text-[11px] ${state.ok ? 'text-up' : 'text-down'}`}>{state.message}</span>}
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(changeOwnPassword, null);
  return (
    <form action={action} className="flex flex-col gap-[11px]">
      <label className="block">
        <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">Current password</span>
        <input name="current" type="password" autoComplete="current-password" required className={box} />
      </label>
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">New</span>
          <input name="next" type="password" autoComplete="new-password" required className={box} />
        </label>
        <label className="flex-1">
          <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">And again</span>
          <input name="again" type="password" autoComplete="new-password" required className={box} />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={primary}>Change password</button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function SignOutLink() {
  return (
    <form action={signOut}>
      <button type="submit" className="text-[12px] text-accent">Sign out</button>
    </form>
  );
}
