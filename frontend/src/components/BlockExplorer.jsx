import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';

const BLOCKS_PER_PAGE = 5;

const BlockExplorer = () => {
  const [blocks, setBlocks] = useState([]);
  const [lastBlock, setLastBlock] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchBlockPage = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(window.location.origin + "/ganache");
      const currentBlockNumber = await provider.getBlockNumber();
      setLastBlock(currentBlockNumber);
      const newBlocks = [];
      const offset = (page - 1) * BLOCKS_PER_PAGE;
      for (let i = 0; i < BLOCKS_PER_PAGE; i++) {
        const blockNum = currentBlockNumber - offset - i;
        if (blockNum < 0) break;
        const block = await provider.getBlock(blockNum);
        if (block) newBlocks.push(block);
      }
      setBlocks(newBlocks);
    } catch (error) {
      console.error("Error fetching block page:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBlockPage();
  }, [page, fetchBlockPage]);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(window.location.origin + "/ganache");
    const onNewBlock = async (blockNumber) => {
      setLastBlock(blockNumber);
      if (page === 1) {
        const newBlock = await provider.getBlock(blockNumber);
        if (newBlock) {
          setBlocks(currentBlocks => [newBlock, ...currentBlocks.slice(0, BLOCKS_PER_PAGE - 1)]);
        }
      }
    };
    provider.on('block', onNewBlock);
    return () => {
      provider.off('block', onNewBlock);
    };
  }, [page]);

  const BlockSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-center animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span className={`w-3 h-3 bg-green-500 rounded-full ${page === 1 ? 'animate-pulse' : ''}`}></span>
          Live Blockchain Status
        </h3>
        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded border border-gray-200 dark:border-gray-600">
          Last Block: #{lastBlock}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4" style={{ minHeight: '450px' }}>
        {loading && blocks.length === 0 ? (
          [...Array(BLOCKS_PER_PAGE)].map((_, i) => <BlockSkeleton key={i} />)
        ) : (
          blocks.map((block) => (
            <div key={block.hash} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                <div className="flex flex-col">
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">Block #{block.number}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">{new Date(Number(block.timestamp) * 1000).toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium text-xs">
                    {block.transactions.length} Txns
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      Gas: {block.gasUsed.toString()} / {block.gasLimit.toString()}
                    </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px]">Hash</span> 
                  <span className="truncate bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded" title={block.hash}>{block.hash}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px]">Parent Hash</span> 
                  <span className="truncate bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded" title={block.parentHash}>{block.parentHash}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={loading || (lastBlock - (page * BLOCKS_PER_PAGE) < 0)}
          className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          &larr; Older
        </button>
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          Page {page}
        </span>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={loading || page === 1}
          className="px-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
        >
          Newer &rarr;
        </button>
      </div>
    </div>
  );
};

export default BlockExplorer;
