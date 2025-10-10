import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import mongoose from "mongoose";
import { FileTypeEnum } from "./types";
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

export const emitter = new EventEmitter()