import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import mongoose from "mongoose";
import { FileTypeEnum, PaginateOptions } from "./types";
import EventEmitter from "events";

const { MONGODB_URI } = process.env;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const connectMongo = async () => {
  try {
    const { connection } = await mongoose.connect(MONGODB_URI as string);
    if (connection.readyState === 1) {
      return Promise.resolve(true);
    }
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

export function mapMimeToFileType(mime: string): FileTypeEnum {
  const [category, subtype] = mime.split('/');

  if (category === 'image') return 'image';
  if (category === 'video') return 'video';
  if (category === 'audio') return 'audio';

  // handle documents
  if (category === 'text') return 'document';
  if (category === 'application') {
    if (
      [
        'pdf',
        'msword',
        'vnd.openxmlformats-officedocument.wordprocessingml.document',
        'vnd.ms-excel',
        'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'rtf',
        'json',
        'xml',
        'csv',
      ].includes(subtype)
    ) {
      return 'document';
    }
  }

  // everything else → others
  return 'others';
}

export const emitter = new EventEmitter();

export async function paginateModel({
  model,
  query = {},
  select = '',
  page = 1,
  limit = 10,
  sort = { createdAt: -1 },
  populate,
}: PaginateOptions) {
  const skip = (page - 1) * limit;

  let queryBuilder = model.find(query).skip(skip).limit(limit).select(select).sort(sort);

  if (populate) {
    queryBuilder = queryBuilder.populate(populate);
  }

  const [total, results] = await Promise.all([
    model.countDocuments(query),
    queryBuilder.lean(),
  ]);

  return {
    data: results,
    meta: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Today"
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }
}