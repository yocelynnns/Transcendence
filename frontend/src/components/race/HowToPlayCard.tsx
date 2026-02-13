import React from "react";

interface Props {
  cardPad: string;
  titleText: string;
  bodyText: string;
}

const HowToPlayCard: React.FC<Props> = ({
  cardPad,
  titleText,
  bodyText,
}) => {
  return (
    <div className={`bg-gray-50 rounded-lg border-l-4 border-green-500 ${cardPad}`}>
      <h3 className={`${titleText} text-gray-800 mb-1.5`}>
        How to Win:
      </h3>

      <ol className={`list-decimal pl-5 space-y-1 ${bodyText}`}>
        <li className="text-gray-600">
          Wait for an opponent (matchmaking)
        </li>
        <li className="text-gray-600">
          Press{" "}
          <strong className="text-green-500 font-bold">
            SPACEBAR
          </strong>{" "}
          fast!
        </li>
        <li className="text-gray-600">
          First to finish wins 🏆
        </li>
      </ol>
    </div>
  );
};

export default HowToPlayCard;