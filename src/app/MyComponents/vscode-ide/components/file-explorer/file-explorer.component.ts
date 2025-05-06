import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  isOpen?: boolean;
  children?: FileNode[];
  parentId?: string | null;
  isEditing?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent {
  @Input() files: FileNode[] = [];
  @Output() fileSelected = new EventEmitter<FileNode>();

  @ViewChild('contextMenu') contextMenu!: ElementRef;
  @ViewChild('newItemInput') newItemInput!: ElementRef;

  contextMenuPosition = { x: '0px', y: '0px' };
  showContextMenu = false;
  selectedNode: FileNode | null = null;
  newItemName = '';
  newItemType: 'file' | 'folder' = 'file';
  showNewItemInput = false;
  editingNode: FileNode | null = null;

  @HostListener('document:click')
  closeContextMenu(): void {
    this.showContextMenu = false;
  }

  toggleFolder(folder: FileNode, event: MouseEvent): void {
    if (folder.type === 'folder') {
      folder.isOpen = !folder.isOpen;
    }
    event.stopPropagation();
  }

  selectFile(file: FileNode, event: MouseEvent): void {
    if (file.type === 'file') {
      this.fileSelected.emit(file);
    }
    event.stopPropagation();
  }

  onContextMenu(event: MouseEvent, node: FileNode): void {
    event.preventDefault();
    this.showContextMenu = true;
    this.selectedNode = node;
    this.contextMenuPosition = {
      x: `${event.clientX}px`,
      y: `${event.clientY}px`
    };
    event.stopPropagation();
  }

  addNewItem(parentNode: FileNode | null = null, type: 'file' | 'folder'): void {
    this.showContextMenu = false;
    this.showNewItemInput = true;
    this.newItemType = type;
    this.selectedNode = parentNode;
    this.newItemName = '';

    setTimeout(() => {
      if (this.newItemInput) {
        this.newItemInput.nativeElement.focus();
      }
    });
  }

  confirmNewItem(): void {
    if (!this.newItemName.trim()) {
      this.cancelNewItem();
      return;
    }

    const newNode: FileNode = {
      id: this.generateId(),
      name: this.newItemName,
      type: this.newItemType,
      content: this.newItemType === 'file' ? '' : undefined,
      isOpen: this.newItemType === 'folder' ? true : undefined,
      children: this.newItemType === 'folder' ? [] : undefined,
      parentId: this.selectedNode ? this.selectedNode.id : null
    };

    if (this.selectedNode && this.selectedNode.type === 'folder') {
      if (!this.selectedNode.children) {
        this.selectedNode.children = [];
      }
      this.selectedNode.children.push(newNode);
      this.selectedNode.isOpen = true;
    } else {
      this.files.push(newNode);
    }

    this.showNewItemInput = false;
    this.newItemName = '';
  }

  cancelNewItem(): void {
    this.showNewItemInput = false;
    this.newItemName = '';
  }

  startRenaming(node: FileNode, event: MouseEvent): void {
    event.stopPropagation();
    this.showContextMenu = false;
    node.isEditing = true;
    this.editingNode = node;
    
    setTimeout(() => {
      const inputElement = document.getElementById(`rename-${node.id}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    });
  }

  finishRenaming(node: FileNode, event: Event): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    
    if (newName && newName !== node.name) {
      node.name = newName;
    }
    
    node.isEditing = false;
    this.editingNode = null;
  }

  deleteItem(node: FileNode): void {
    this.showContextMenu = false;
    
    // Find and remove the node from the tree
    if (node.parentId) {
      this.removeFromParent(node, this.files);
    } else {
      const index = this.files.findIndex(item => item.id === node.id);
      if (index !== -1) {
        this.files.splice(index, 1);
      }
    }
  }

  private removeFromParent(node: FileNode, items: FileNode[]): void {
    for (const item of items) {
      if (item.id === node.parentId) {
        const index = item.children?.findIndex(child => child.id === node.id) ?? -1;
        if (index !== -1 && item.children) {
          item.children.splice(index, 1);
        }
        return;
      }
      
      if (item.children && item.children.length > 0) {
        this.removeFromParent(node, item.children);
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
} 