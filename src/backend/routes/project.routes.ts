import express from "express";
import { v4 as uuidv4 } from "uuid";
import supabase from "../config/supabase";

const router = express.Router();

// Get all projects for the authenticated user
router.get("/", async (req, res) => {
  try {
    const userId = req.headers["user-id"] as string;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Get a specific project by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["user-id"] as string;
    const projectId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Project not found" });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Create a new project
router.post("/", async (req, res) => {
  try {
    const userId = req.headers["user-id"] as string;
    const { title, description, status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          title,
          description,
          status: status || "active"
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Failed to create project" });
  }
});

// Update a project
router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["user-id"] as string;
    const projectId = req.params.id;
    const { title, description, status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if project exists and belongs to user
    const { data: existingProject, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Project not found" });
      }
      throw fetchError;
    }

    // Update project
    const { data, error } = await supabase
      .from("projects")
      .update({
        title: title || existingProject.title,
        description: description !== undefined ? description : existingProject.description,
        status: status || existingProject.status,
        updated_at: new Date()
      })
      .eq("id", projectId)
      .eq("user_id", userId)
      .select();

    if (error) {
      throw error;
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["user-id"] as string;
    const projectId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if project exists and belongs to user
    const { data: existingProject, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Project not found" });
      }
      throw fetchError;
    }

    // Delete project
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ error: "Failed to delete project" });
  }
});

// Get all videos in a project
router.get("/:id/videos", async (req, res) => {
  try {
    const userId = req.headers["user-id"] as string;
    const projectId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if project exists and belongs to user
    const { data: existingProject, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({ error: "Project not found" });
      }
      throw fetchError;
    }

    // Get videos in project
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching project videos:", error);
    return res.status(500).json({ error: "Failed to fetch project videos" });
  }
});

export default router;