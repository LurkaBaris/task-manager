import { File, FileArchive, FileImage, FileText } from 'lucide-react';

interface TaskCommentAttachmentIconProps {
  type: string;
  size?: number;
}

export const TaskCommentAttachmentIcon = ({ type, size = 18 }: TaskCommentAttachmentIconProps) => {
  if (type.startsWith('image/')) {
    return <FileImage size={size} />;
  }

  if (type === 'application/pdf') {
    return <FileText size={size} />;
  }

  if (type.includes('zip') || type.includes('rar') || type.includes('archive')) {
    return <FileArchive size={size} />;
  }

  return <File size={size} />;
};
