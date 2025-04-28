import { render, fireEvent, screen } from '@testing-library/react';
import { Stage } from 'konva/lib/Stage';
import Canvas from '../Canvas';
import { TextElement } from '../../../types/canvas';

describe('Text Tool Functionality', () => {
  // Test text element creation
  it('should create a text element when clicking on canvas with text tool selected', () => {
    const { container } = render(<Canvas name="test" description="test" projectId="test" />);
    
    // Select text tool
    const textToolButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textToolButton);
    
    // Click on canvas
    const stage = container.querySelector('.konvajs-content');
    if (stage) {
      fireEvent.click(stage, { clientX: 100, clientY: 100 });
    }
    
    // Verify text element was created
    const textElements = screen.getAllByText('Double click to edit');
    expect(textElements.length).toBe(1);
  });

  // Test text editing
  it('should allow editing text on double click', () => {
    const { container } = render(<Canvas name="test" description="test" projectId="test" />);
    
    // Create text element
    const textToolButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textToolButton);
    
    const stage = container.querySelector('.konvajs-content');
    if (stage) {
      fireEvent.click(stage, { clientX: 100, clientY: 100 });
    }
    
    // Double click text element
    const textElement = screen.getByText('Double click to edit');
    fireEvent.dblClick(textElement);
    
    // Verify textarea appears
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  // Test text formatting
  it('should apply formatting changes to text elements', () => {
    const { container } = render(<Canvas name="test" description="test" projectId="test" />);
    
    // Create text element
    const textToolButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textToolButton);
    
    const stage = container.querySelector('.konvajs-content');
    if (stage) {
      fireEvent.click(stage, { clientX: 100, clientY: 100 });
    }
    
    // Click text element to show format menu
    const textElement = screen.getByText('Double click to edit');
    fireEvent.click(textElement);
    
    // Change font size
    const fontSizeSelect = screen.getByRole('combobox');
    fireEvent.change(fontSizeSelect, { target: { value: '24' } });
    
    // Verify font size change
    expect(textElement).toHaveStyle({ fontSize: '24px' });
  });

  // Test text element locking
  it('should prevent editing locked text elements', () => {
    const { container } = render(<Canvas name="test" description="test" projectId="test" />);
    
    // Create text element
    const textToolButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textToolButton);
    
    const stage = container.querySelector('.konvajs-content');
    if (stage) {
      fireEvent.click(stage, { clientX: 100, clientY: 100 });
    }
    
    // Click text element to show format menu
    const textElement = screen.getByText('Double click to edit');
    fireEvent.click(textElement);
    
    // Lock the text element
    const lockButton = screen.getByRole('button', { name: /lock/i });
    fireEvent.click(lockButton);
    
    // Try to edit locked text
    fireEvent.dblClick(textElement);
    const textarea = screen.queryByRole('textbox');
    expect(textarea).not.toBeInTheDocument();
  });

  // Test text element deletion
  it('should allow deleting text elements', () => {
    const { container } = render(<Canvas name="test" description="test" projectId="test" />);
    
    // Create text element
    const textToolButton = screen.getByRole('button', { name: /text/i });
    fireEvent.click(textToolButton);
    
    const stage = container.querySelector('.konvajs-content');
    if (stage) {
      fireEvent.click(stage, { clientX: 100, clientY: 100 });
    }
    
    // Click text element to show format menu
    const textElement = screen.getByText('Double click to edit');
    fireEvent.click(textElement);
    
    // Delete the text element
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Verify text element is removed
    expect(screen.queryByText('Double click to edit')).not.toBeInTheDocument();
  });
}); 