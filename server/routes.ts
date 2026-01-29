import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSitemap } from "./generate-sitemap";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Sitemap route - must return XML with proper Content-Type
  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.send(generateSitemap());
  });

  return httpServer;
}
