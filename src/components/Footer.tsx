import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and Mission */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Seen
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md">
              A safe space to document experiences of racial discrimination and bias, 
              helping communities understand patterns and advocate for change.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
              <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                <strong>Prototype Notice:</strong> This is a conceptual application for demonstration purposes. 
                Data is stored locally and not transmitted to any servers.
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  About & Safety
                </Link>
              </li>
              <li>
                <Link 
                  to="/explore" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  Explore Data
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  onClick={(e) => e.preventDefault()}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                  onClick={(e) => e.preventDefault()}
                >
                  Support Resources
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 Seen. This is a prototype application for demonstration purposes.
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Built with care for communities
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Made with Bob
