const DevelopmentWarning = () => {
  return (
    <div
      className="app-container mt-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong className="font-bold">Development Warning!</strong>
      <span className="block sm:inline ps-2">
        We are currently in development mode hence can change frequently. You
        may find some unexpected behavior. But don't worry, we're working hard
        to fix them! We appreciate your patience and understanding. Thank you
        for your support!
      </span>
    </div>
  );
};

export default DevelopmentWarning;
