import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Scissors } from "lucide-react";

const GITHUB_OWNER = "Krishnam2411";
const GITHUB_REPO = "Snippets";
const GITHUB_BRANCH = "main";
const STORAGE_KEY = "justcopy_data";
const EXPIRY_TIME = 60 * 60; // 1 hour

type NODE = {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size?: number;
  url: string;
};

async function fetchTree(owner: string, repo: string, branch: string = "main") {
  const branchResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`
  );
  const branchData = await branchResponse.json();

  const treeSha = branchData.commit.sha;

  const treeResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`
  );
  const treeData = await treeResponse.json();

  return treeData.tree;
}

function buildHierarchy(tree: NODE[]): string[] {
  const filePaths: string[] = [];

  tree.forEach((node: NODE) => {
    if (node.type === "blob" && !node.path.endsWith(".gitignore") && !node.path.endsWith("README.md")) {
      filePaths.push(node.path);
    }
  });

  return filePaths;
}

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [files, setFiles] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    const fetchAndSaveHierarchy = async () => {
      try {
        const savedFiles = localStorage.getItem(STORAGE_KEY);
        const savedTimestamp = localStorage.getItem(`${STORAGE_KEY}_timestamp`);

        const isExpired =
          !savedTimestamp ||
          Date.now() - parseInt(savedTimestamp) > EXPIRY_TIME;

        if (savedFiles) {
          setFiles(JSON.parse(savedFiles));

          if (isExpired) {
            const tree = await fetchTree(
              GITHUB_OWNER,
              GITHUB_REPO,
              GITHUB_BRANCH
            );
            const newFiles = buildHierarchy(tree);
            setFiles(newFiles);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
            localStorage.setItem(
              `${STORAGE_KEY}_timestamp`,
              Date.now().toString()
            );
          }
        } else {
          setIsFetching(true);
          const tree = await fetchTree(
            GITHUB_OWNER,
            GITHUB_REPO,
            GITHUB_BRANCH
          );
          const newFiles = buildHierarchy(tree);
          setFiles(newFiles);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
          localStorage.setItem(
            `${STORAGE_KEY}_timestamp`,
            Date.now().toString()
          );
          setIsFetching(false);
        }
      } catch (error) {
        console.error("Error fetching or saving hierarchy:", error);
        setIsFetching(false);
      }
    };

    fetchAndSaveHierarchy();

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const matches = files.filter((file) =>
        file.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(matches.slice(0, 10));
    } else {
      setSuggestions([]);
    }
  };

  const handleCopy = async (filePath: string) => {
    try {
      const fileUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
      const fileContent = await fetchFileContent(fileUrl);
      await navigator.clipboard.writeText(fileContent).then(() => {
          setMessage("Snippet copied to clipboard!");
          setTimeout(() => setMessage(null), 2000);
        },
        (err) => {
          setMessage("Failed to copy: " + err);
          setTimeout(() => setMessage(null), 3000);
        }
      );
      
    } catch (error) {
      setMessage("Error copying snippet:" + error);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const fetchFileContent = async (fileUrl: string) => {
    const fileResponse = await fetch(fileUrl, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
      },
    });

    if (!fileResponse.ok) {
      throw new Error("Failed to fetch file content");
    }

    return fileResponse.text();
  }

  return (
    <main className="flex flex-col gap-4 p-4 bg-blue-950 w-[400px] m-px rounded-md">
      <h1 className="flex justify-center gap-2 items-center text-white font-mono font-bold text-2xl uppercase text-center">
        Just
        <Scissors /> <span className="text-pink-400">Copy</span>
      </h1>

      {isOnline ? (
        <>
          {isFetching ? (
            <div className="text-white text-center">Fetching file data...</div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Just search & click to copy"
                value={searchQuery}
                onChange={handleSearchChange}
                className="font-mono text-lg text-blue-950 bg-blue-100 w-full"
              />

              {searchQuery && (
                <>
                  {suggestions.length === 0 ? (
                    <div className="text-white text-center">
                      No matching files found
                    </div>
                  ) : (
                    <ul className="text-white">
                      {suggestions.map((file, index) => (
                        <li
                          key={index}
                          className="cursor-pointer hover:text-pink-400 font-mono"
                          onClick={() => handleCopy(file)}
                        >
                          {file}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-white text-center">You are offline</div>
      )}
      <>
        {message && (
          <div className="text-center text-pink-400 text-base font-sans">
            {message}
          </div>
        )}
      </>
    </main>
  );
}

export default App;
