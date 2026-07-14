import React, { useState, useEffect } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "../services/api";
import { CategoryForm } from "../components/CategoryForm";
import { getCategoryEmoji } from "../constants/categoryEmojis";
import { Modal, Button, ItemTable } from "../vibes";
import { COLORS } from "../constants/colors";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [actionError, setActionError] = useState<string | undefined>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      // Show the most recently created categories first.
      const sorted = [...data].sort((a, b) => {
        const aTime = a.created_at ? Date.parse(a.created_at) : 0;
        const bTime = b.created_at ? Date.parse(b.created_at) : 0;
        return bTime - aTime;
      });
      setCategories(sorted);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setActionError(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setActionError(undefined);
    setIsFormOpen(true);
  };

  const handleSubmit = async (name: string, emoji: string) => {
    if (editing) {
      await updateCategory(editing.id, { name, emoji });
    } else {
      await createCategory(name, emoji);
    }
    setIsFormOpen(false);
    setEditing(null);
    loadCategories();
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Delete the "${category.name}" category? This cannot be undone.`,
    );
    if (!confirmed) return;

    setActionError(undefined);
    try {
      await deleteCategory(category.id);
      loadCategories();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to delete category",
      );
    }
  };

  const pageStyle: React.CSSProperties = {
    padding: "48px 64px",
    minHeight: "100vh",
    background: COLORS.secondary.s01,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "40px",
    fontWeight: 700,
    color: COLORS.secondary.s10,
    margin: 0,
  };

  const loadingStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    padding: "48px",
    fontSize: "18px",
    color: COLORS.secondary.s08,
  };

  const errorStyle: React.CSSProperties = {
    marginBottom: "16px",
    padding: "12px 16px",
    borderRadius: "0.375rem",
    background: "#fdecea",
    color: COLORS.danger,
    fontSize: "0.875rem",
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "flex-end",
  };

  const columns = [
    {
      key: "emoji",
      header: "Icon",
      width: "80px",
      align: "center" as const,
      render: (category: Category) => (
        <span style={{ fontSize: "24px" }}>
          {category.emoji || getCategoryEmoji(category.name)}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (category: Category) => (
        <span style={{ fontWeight: 600 }}>{category.name}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (category: Category) => (
        <div style={actionsStyle}>
          <Button size="small" variant="secondary" onClick={() => openEdit(category)}>
            Edit
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => handleDelete(category)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Categories</h1>
        <Button variant="primary" onClick={openAdd}>
          Add Category
        </Button>
      </div>

      {actionError && <div style={errorStyle}>{actionError}</div>}

      {loading ? (
        <div style={loadingStyle}>Loading...</div>
      ) : (
        <ItemTable
          columns={columns}
          data={categories}
          emptyMessage="No categories yet. Add your first one!"
        />
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "Edit Category" : "Add New Category"}
      >
        <CategoryForm
          key={editing?.id ?? "new"}
          initialData={
            editing ? { name: editing.name, emoji: editing.emoji } : undefined
          }
          submitLabel={editing ? "Save Changes" : "Add Category"}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default CategoriesPage;
