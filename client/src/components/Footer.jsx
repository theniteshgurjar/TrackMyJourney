import React from 'react';
import { Train, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Train className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-gray-900">TrackMyJourney</span>
          </div>
          <div className="text-gray-500 text-sm flex items-center">
            Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> for travelers
          </div>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">About</span>
              About
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Contact</span>
              Contact
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Terms</span>
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
