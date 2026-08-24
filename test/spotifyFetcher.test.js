import { describe, it, expect } from "vitest";
import { parseSpotifyPlaylistId } from "../spotifyFetcher.js";

describe("spotifyFetcher", () => {
  it("extracts playlist id from https URL", () => {
    expect(
      parseSpotifyPlaylistId("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=123456")
    ).toBe("37i9dQZF1DXcBWIGoYBM5M");
  });

  it("extracts playlist id from spotify URI", () => {
    expect(parseSpotifyPlaylistId("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M")).toBe(
      "37i9dQZF1DXcBWIGoYBM5M"
    );
  });

  it("extracts raw playlist id string", () => {
    expect(parseSpotifyPlaylistId("37i9dQZF1DXcBWIGoYBM5M")).toBe("37i9dQZF1DXcBWIGoYBM5M");
  });

  it("returns null for invalid strings", () => {
    expect(parseSpotifyPlaylistId("")).toBeNull();
    expect(parseSpotifyPlaylistId("not a playlist")).toBeNull();
    expect(parseSpotifyPlaylistId(null)).toBeNull();
  });
});
