import React from 'react';
import { Archive, Trash2, RotateCcw } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { motion, AnimatePresence } from 'framer-motion';

const Archived = () => {
  const { todos, restoreTodo, deleteTodo } = useTodos();

  const archivedTodos = todos.filter(t => t.archived);

  return (
    <motion.div className="space-y-6">
      <h2 className="text-3xl font-bold">📦 Archived Tasks</h2>

      <AnimatePresence>
        {archivedTodos.map(todo => (
          <motion.div
            key={todo._id}
            className="flex justify-between p-4 bg-white rounded-xl shadow"
          >
            <span className="line-through">{todo.text}</span>

            <div className="flex gap-2">
              <button onClick={() => restoreTodo(todo._id)}>
                <RotateCcw />
              </button>

              <button onClick={() => deleteTodo(todo._id)}>
                <Trash2 />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default Archived;
