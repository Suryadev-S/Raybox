import { cn, formatDate, formatFileSize } from "@/lib/utils";
import axios from "axios";
import { File, Folder } from "lucide-react";
import { headers } from "next/headers";

interface Item {
  _id: string
  name: string
  type: "file" | "collection"
  size?: number
  mimeType?: string
  createdAt: string
  updatedAt: string
  storagePath?: string
  thumbnail?: any
  description?: string
}

const View = ({ r }: { r: Item[] }) => {
  return (
    <section className="flex-1 overflow-auto bg-background px-6 py-6">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {r.length == 0 ? (
          <li className="flex flex-col items-center justify-center h-full text-center">
            <Folder className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">No files found</p>
            <p className="text-sm text-muted-foreground">This directory is empty</p>
          </li>
        ) :
          r.map((item: Item) => (
            <li key={item._id}>
              {/* File Card */}
              <div
                className={cn(
                  "group relative rounded-lg border transition-all duration-200",
                  "hover:border-primary/50 hover:shadow-lg cursor-pointer",
                )}
              >
                {/* Selection Checkbox */}

                {/* Thumbnail Area */}
                <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg overflow-hidden flex items-center justify-center">
                  {item.type == "collection" && (Object.keys(item.thumbnail).length > 0 ? (
                    <img
                      alt={item.name}
                      src={`http://localhost:3000/api/raybox/${item.thumbnail.storagePath}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Folder className="w-12 h-12 text-primary/60" />
                  ))}
                  {item.type == 'file' && (Object.keys(item.thumbnail).length > 0 ? (
                    <img
                      alt={item.name}
                      src={`http://localhost:3000/api/raybox/${item.thumbnail.storagePath}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <File className="w-12 h-12 text-muted-foreground/60" />
                  ))}

                  {/* File Type Badge */}
                  {item.type == 'file' && (
                    <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-foreground">
                      {item.mimeType ? item.mimeType.split("/")[1].toUpperCase() : "FILE"}
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-4">
                  <h3
                    className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors"
                    title={item.name}
                  >
                    {item.name}
                  </h3>

                  {/* File Details */}
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {item.size && <p>{formatFileSize(item.size)}</p>}
                    <p>Modified: {formatDate(item.updatedAt)}</p>
                    {item.description && <p className="line-clamp-2 text-foreground/70 mt-2">{item.description}</p>}
                  </div>

                  {/* Folder Indicator */}
                  {item.type == 'collection' && (
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <Folder className="w-3 h-3" />
                      Folder
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))
        }
      </ul>
    </section>
  )
}

const RayboxHome = async () => {
  let resource: any | null = null;
  try {
    const res = await axios.get('http://localhost:3000/api/raybox', {
      headers: {
        'Cookie': (await headers()).get("cookie") ?? '',
      },
    });
    if (res.status != 200) {
      console.error('Error in the api');
      throw new Error;
    }

    resource = res.data;
    // console.log(resource);
  } catch (error) {
    console.error(error);
  }
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Content Area */}
      <p className="text-sm text-muted-foreground px-6">
        {resource.meta.totalItems} items
      </p>
      <View r={resource.data} />
    </div>
  );
};

export default RayboxHome;