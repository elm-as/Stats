import { useState } from 'react';
import { FolderOpen, Plus, Check, Users, Trash2 } from 'lucide-react';
import { useListWorkspacesQuery, useCreateWorkspaceMutation, useDeleteWorkspaceMutation } from '../store/api';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setActiveWorkspace } from '../store/slices/authSlice';
import { useToast } from './ui/Toast';
import { extractErrorMessage } from './ui/errorMessage';

export default function WorkspaceSelector() {
  const { data, isLoading } = useListWorkspacesQuery();
  const [createWorkspace] = useCreateWorkspaceMutation();
  const [deleteWorkspace, { isLoading: isDeleting }] = useDeleteWorkspaceMutation();
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((s) => s.auth.activeWorkspaceId);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const toast = useToast();

  const workspaces = data?.workspaces || [];

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const ws = await createWorkspace({ name: newName.trim() }).unwrap();
      dispatch(setActiveWorkspace(ws.id));
      setNewName('');
      setShowCreate(false);
    } catch {
      // Error handled by RTK Query
    }
  };

  const handleDelete = async (workspaceId: string, workspaceName: string) => {
    const confirmed = window.confirm(`Supprimer définitivement le workspace "${workspaceName}" ?`);
    if (!confirmed) return;

    try {
      await deleteWorkspace(workspaceId).unwrap();
      if (activeId === workspaceId) {
        dispatch(setActiveWorkspace(null));
      }
    } catch (error) {
      console.error('Workspace delete failed:', error);
      toast.error({ title: 'Suppression échouée', description: extractErrorMessage(error) });
    }
  };

  if (isLoading) {
    return <div className="text-surface-400 text-sm px-3 py-2">Chargement...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-surface-500 uppercase tracking-wider font-medium">Espace de travail</span>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-accent-400 hover:text-accent-300 transition-colors"
          title="Nouveau workspace"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showCreate && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex-1 bg-surface-800/50 border border-surface-700/50 rounded-lg px-3 py-1.5 text-sm text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-1 focus:ring-accent-400/40"
            placeholder="Nom du workspace"
            autoFocus
          />
          <button onClick={handleCreate} className="text-accent-400 hover:text-accent-300" title="Créer le workspace">
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Personal workspace (no workspace = personal) */}
      <button
        onClick={() => dispatch(setActiveWorkspace(null))}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
          !activeId
            ? 'bg-accent-400/10 text-accent-300 ring-1 ring-accent-400/20'
            : 'text-surface-300 hover:bg-white/[0.04] hover:text-surface-100'
        }`}
      >
        <FolderOpen className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">Personnel</span>
      </button>

      {workspaces.map((ws) => (
        <div
          key={ws.id}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
            activeId === ws.id
              ? 'bg-accent-400/10 text-accent-300 ring-1 ring-accent-400/20'
              : 'text-surface-300 hover:bg-white/[0.04] hover:text-surface-100'
          }`}
        >
          <button
            type="button"
            onClick={() => dispatch(setActiveWorkspace(ws.id))}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{ws.name}</span>
            <span className="text-[10px] text-surface-500 ml-auto">{ws.datasets_count}</span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(ws.id, ws.name)}
            disabled={isDeleting}
            className="p-1 rounded text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            title="Supprimer le workspace"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
